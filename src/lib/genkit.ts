import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { firebase } from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    // Vertex AI handles the auth via your Firebase environment
    vertexAI({ location: 'us-central1' }), 
    firebase(),
  ],
});

export const myFlow = ai.defineFlow('myFlow', async (input: string) => {
  const { text } = await ai.generate({
    model: 'vertexai/gemini-1.5-flash',
    prompt: input,
  });
  return text;
});