'use client';

import React, { useState, useRef, useEffect } from 'react';

const MicrophoneRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('MicrophoneRecorder component mounted');
    // Clean up WebSocket on component unmount
    return () => {
      console.log('MicrophoneRecorder component unmounting');
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
      audioChunksRef.current = [];
      setTranscript('');
      setInterimTranscript('');

      // Establish WebSocket connection
      wsRef.current = new WebSocket(`ws://${window.location.host}/api/speech-to-text`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        wsRef.current?.send('start'); // Send a start signal to the server
        mediaRecorderRef.current?.start(1000); // Start recording, send data every 1 second
        setIsRecording(true);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data as string);
        if (data.transcript) {
          if (data.isFinal) {
            setTranscript((prev) => prev + data.transcript + ' ');
            setInterimTranscript('');
          } else {
            setInterimTranscript(data.transcript);
          }
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsRecording(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('WebSocket error occurred. Check console for details.');
        setIsRecording(false);
      };

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

    } catch (error) {
      console.error('Error accessing microphone or establishing WebSocket:', error);
      alert('Could not access microphone or connect to speech-to-text service. Please ensure microphone is connected, permissions are granted, and the server is running.');
    }
  };

  const stopRecording = () => {
    console.trace('stopRecording called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    if (isRecording) {
      setIsRecording(false);
      console.log('Recording stopped.');
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-card flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Real-time Voice to Text</h2>
      <div className="flex gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-6 py-3 rounded-full text-white font-bold transition-colors shadow-lg ${
            isRecording ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRecording ? 'Recording...' : 'Start Transcription'}
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-6 py-3 rounded-full text-white font-bold transition-colors shadow-lg ${
            !isRecording ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Stop Transcription
        </button>
      </div>
      {isRecording && <p className="text-sm text-blue-500">Listening for speech...</p>}
      <div className="mt-6 p-4 w-full bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner min-h-[100px] text-left">
        <p className="text-gray-700 dark:text-gray-200 text-lg">
          {transcript}
          <span className="text-gray-500 dark:text-gray-400">{interimTranscript}</span>
        </p>
        {!transcript && !interimTranscript && !isRecording && (
          <p className="text-gray-400 dark:text-gray-500">Start recording to see transcription here...</p>
        )}
      </div>
    </div>
  );
};

export default MicrophoneRecorder;