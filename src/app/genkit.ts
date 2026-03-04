import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

export const recipeFlow = ai.defineFlow(
  {
    name: 'recipeFlow',
    inputSchema: z.string(), // The ingredient
    outputSchema: z.object({
      recipeName: z.string(),
      instructions: z.array(z.string()),
    }),
  },
  async (subject) => {
    const { output } = await ai.generate({
      prompt: `Suggest a creative recipe using ${subject}`,
    });
    return output;
  }
);