// lib/genkit.ts
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, runFlow } from '@genkit-ai/flow';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
});

export const transcribeFlow = defineFlow(
  { name: 'transcribeFlow', inputSchema: z.string() }, // Base64 Audio
  async (base64Audio) => {
    // This calls the Gemini Multimodal model which can process audio directly
    const response = await generate({
      model: 'gemini-1.5-flash',
      prompt: [
        { text: 'Transcribe this audio accurately. Clean up filler words like "um" or "ah".' },
        { media: { url: `data:audio/wav;base64,${base64Audio}`, contentType: 'audio/wav' } },
      ],
    });
    return response.text();
  }
);