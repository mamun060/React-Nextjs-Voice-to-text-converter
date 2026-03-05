'use client'; // Add this directive at the top

import MicrophoneRecorder from '@/components/MicrophoneRecorder';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <MicrophoneRecorder />
    </div>
  );
}
