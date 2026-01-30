'use server';
/**
 * @fileOverview Extracts keywords from memory captions using a fallback algorithm
 * (stopword removal and noun detection) or, if available, a more sophisticated LLM.
 *
 * - extractKeywords - Extracts keywords from memory captions.
 * - ExtractKeywordsInput - The input type for the extractKeywords function.
 * - ExtractKeywordsOutput - The return type for the extractKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeywordsInputSchema = z.object({
  caption: z.string().describe('The caption of the memory.'),
});
export type ExtractKeywordsInput = z.infer<typeof ExtractKeywordsInputSchema>;

const ExtractKeywordsOutputSchema = z.object({
  keywords: z.array(z.string()).describe('The extracted keywords.'),
});
export type ExtractKeywordsOutput = z.infer<typeof ExtractKeywordsOutputSchema>;

export async function extractKeywords(input: ExtractKeywordsInput): Promise<ExtractKeywordsOutput> {
  return extractKeywordsFlow(input);
}

const keywordExtractionPrompt = ai.definePrompt({
  name: 'keywordExtractionPrompt',
  input: {schema: ExtractKeywordsInputSchema},
  output: {schema: ExtractKeywordsOutputSchema},
  prompt: `Extract keywords from the following text. Return the keywords as a list of strings.

Text: {{{caption}}}`,
});

const extractKeywordsFlow = ai.defineFlow(
  {
    name: 'extractKeywordsFlow',
    inputSchema: ExtractKeywordsInputSchema,
    outputSchema: ExtractKeywordsOutputSchema,
  },
  async input => {
    try {
      const {output} = await keywordExtractionPrompt(input);
      return output!;
    } catch (e) {
      console.error('Error extracting keywords with LLM, falling back to default extraction:', e);

      // Fallback keyword extraction (simple stopword removal + noun heuristic)
      const caption = input.caption.toLowerCase();
      const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'not', 'for', 'of', 'at', 'by', 'to', 'from', 'in', 'on', 'with']);
      const words = caption.split(/\s+/);
      const keywords = words
        .filter(word => !stopWords.has(word))
        .filter(word => word.length > 2) // Basic heuristic: longer words are more likely to be keywords
        .filter(word => /^[a-z]+$/.test(word)); // Only allow words comprised of lowercase letters

      return {keywords};
    }
  }
);
