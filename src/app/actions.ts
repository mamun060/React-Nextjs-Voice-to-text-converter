import { genkit, z } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

export const recipeFlow = ai.defineFlow(
  {
    name: 'recipeFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (ingredient, { sendChunk }) => {
    const { response, stream } = await ai.generateStream(
      `Give me a quick recipe using ${ingredient}`
    );

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }
    return (await response).text;
  }
);