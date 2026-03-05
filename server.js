// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const speech = require('@google-cloud/speech'); // Import Google Cloud Speech-to-Text

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// When using middleware, `hostname` and `port` might be omitted.
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize Google Cloud Speech-to-Text client
const client = new speech.SpeechClient();

// Speech-to-Text configuration
const requestConfig = {
  config: {
    encoding: 'WEBM_OPUS', // Assuming audio is sent as WebM Opus
    sampleRateHertz: 48000, // Adjust based on client's audio settings
    languageCode: 'en-US',
  },
  interimResults: true, // Get interim results
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    let recognizeStream = null;

    ws.on('message', (message) => {
      // Assuming the first message from the client is a 'start' signal or configuration
      // and subsequent messages are audio data.
      if (typeof message === 'string' && message === 'start') {
        console.log('Received start signal. Starting speech recognition stream.');
        recognizeStream = client
          .streamingRecognize(requestConfig)
          .on('error', console.error)
          .on('data', (data) => {
            // Send transcription results back to the client
            if (data.results[0] && data.results[0].alternatives[0]) {
              ws.send(
                JSON.stringify({
                  transcript: data.results[0].alternatives[0].transcript,
                  isFinal: data.results[0].isFinal,
                })
              );
            }
          });
      } else if (recognizeStream) {
        // Send audio data to Google Cloud Speech-to-Text
        recognizeStream.write(message);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      if (recognizeStream) {
        recognizeStream.end();
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (recognizeStream) {
        recognizeStream.end();
      }
    });
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url, true);

    if (pathname === '/api/speech-to-text') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});