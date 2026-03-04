import { menuSuggestionFlow } from '@/lib/genkit';
import { appRoute } from '@genkit-ai/next';

// This helper automatically handles the POST request and streaming
export const POST = appRoute(menuSuggestionFlow);