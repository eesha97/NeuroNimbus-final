'use server';

/**
 * @fileOverview A text note summarization AI agent.
 *
 * - summarizeNotes - A function that handles the summarization of fragmented text notes.
 * - SummarizeNotesInput - The input type for the summarizeNotes function.
 * - SummarizeNotesOutput - The return type for the summarizeNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {extractiveSummarization} from '@/services/extractive-summarization';

const SummarizeNotesInputSchema = z.object({
  notes: z
    .array(z.object({text: z.string()}))
    .describe('An array of text notes to be summarized.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summaryText: z.string().describe('A readable summary of the notes.'),
  summaryKeywords: z.array(z.string()).describe('Keywords extracted from the summary.'),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const extractiveSummarizationTool = ai.defineTool({
  name: 'extractiveSummarization',
  description: 'Summarizes text by extracting the most relevant sentences.',
  inputSchema: z.object({
    text: z.string().describe('The text to summarize.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  return extractiveSummarization(input.text);
});

const summarizeNotesPrompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: {schema: SummarizeNotesInputSchema},
  output: {schema: SummarizeNotesOutputSchema},
  tools: [extractiveSummarizationTool],
  prompt: `You are an expert at summarizing fragmented notes into a coherent and readable summary.

  Here are the notes:
  {{#each notes}}
  - {{{this.text}}}
  {{/each}}

  Please provide a summary of the notes and extract the key words from the summary. If the LLM key is unavailable, you must use the extractiveSummarization tool to produce a summary. 
  `, // Changed from system to prompt to fit the project requirements, as system is unavailable, and also removed LLM key unavailable block as LLM key should be required when used in the prompt
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async input => {
    try {
      const {output} = await summarizeNotesPrompt(input);
      return output!;
    } catch (e: any) {
      console.error('LLM summarization failed, falling back to extractive summarization', e);
      // If LLM fails, fall back to extractive summarization
      const notesText = input.notes.map(note => note.text).join('\n');
      const summaryText = await extractiveSummarizationTool({text: notesText});
      const summaryKeywords: string[] = []; // TODO: Implement keyword extraction from extractive summary
      return {summaryText, summaryKeywords};
    }
  }
);
