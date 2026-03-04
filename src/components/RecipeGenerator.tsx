'use client';

import { useState } from 'react';
import { getStreamingRecipe } from '@/app/actions';
import { readStream } from '@genkit-ai/next/client';

export default function RecipeGenerator() {
  const [recipe, setRecipe] = useState('');

  async function handleSubmit(formData: FormData) {
    const ingredient = formData.get('ingredient') as string;
    setRecipe(''); // Reset UI

    const stream = await getStreamingRecipe(ingredient);
    
    // Modern way to consume Genkit streams in the browser
    for await (const chunk of readStream(stream)) {
      setRecipe((prev) => prev + chunk);
    }
  }

  return (
    <div className="p-6 border rounded-xl bg-card">
      <form action={handleSubmit} className="flex gap-2 mb-4">
        <input 
          name="ingredient" 
          placeholder="Enter an ingredient..." 
          className="bg-input p-2 rounded"
        />
        <button type="submit" className="bg-primary px-4 py-2 rounded">
          Generate
        </button>
      </form>
      
      <div className="whitespace-pre-wrap leading-relaxed">
        {recipe || "Your recipe will appear here..."}
      </div>
    </div>
  );
}