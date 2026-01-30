'use server';

/**
 * @fileOverview Detects near-duplicate memories using image hashing and an LLM.
 *
 * - detectDuplicateMemories - A function that handles the duplicate memory detection process.
 * - DetectDuplicateMemoriesInput - The input type for the detectDuplicateMemories function.
 * - DetectDuplicateMemoriesOutput - The return type for the detectDuplicateMemories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import sharp from 'sharp';

const DetectDuplicateMemoriesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a memory, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  existingImageHashes: z.array(z.string()).describe('Array of existing image hashes for the patient.'),
  caption: z.string().describe('The caption associated with the memory.'),
});

export type DetectDuplicateMemoriesInput = z.infer<typeof DetectDuplicateMemoriesInputSchema>;

const DetectDuplicateMemoriesOutputSchema = z.object({
  isDuplicateCandidate: z
    .boolean()
    .describe('Whether the memory is a potential duplicate of an existing memory.'),
  duplicateReason: z
    .string()
    .describe('The reason why the memory is considered a duplicate, if any.'),
});

export type DetectDuplicateMemoriesOutput = z.infer<typeof DetectDuplicateMemoriesOutputSchema>;

export async function detectDuplicateMemories(
  input: DetectDuplicateMemoriesInput
): Promise<DetectDuplicateMemoriesOutput> {
  return detectDuplicateMemoriesFlow(input);
}

const computeImageHash = ai.defineTool({
  name: 'computeImageHash',
  description: 'Computes a perceptual hash (pHash) of an image to detect near-duplicates.',
  inputSchema: z.object({
    photoDataUri: z
      .string()
      .describe(
        "A photo of a memory, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  }),
  outputSchema: z.string().describe('The perceptual hash (pHash) of the image.'),
},
async (input) => {
  const imageBuffer = Buffer.from(input.photoDataUri.split(',')[1], 'base64');
  const hashBuffer = await sharp(imageBuffer).resize(16, 16, {fit: 'fill'}).greyscale().raw().toBuffer();

    let hash = '';
    for (let i = 0; i < hashBuffer.length; i++) {
      hash += (hashBuffer[i] > 128) ? '1' : '0';
    }

  return hash;
});

const prompt = ai.definePrompt({
  name: 'detectDuplicateMemoriesPrompt',
  input: {schema: DetectDuplicateMemoriesInputSchema},
  output: {schema: DetectDuplicateMemoriesOutputSchema},
  tools: [computeImageHash],
  prompt: `You are an AI assistant that helps caregivers identify duplicate memories.

You are given a photo and its caption, as well as a list of image hashes of existing memories.

Your task is to determine if the given photo is a near-duplicate of any of the existing memories.

Consider both the image hash distance and the caption similarity when making your determination.

If the image hash distance is below a threshold (e.g., 5 bits different) AND the captions are similar, then the memory is likely a duplicate.

Use the computeImageHash tool to compute the image hash of the given photo.

Existing Image Hashes: {{{existingImageHashes}}}

Caption: {{{caption}}}

Photo: {{media url=photoDataUri}}

Based on the image and caption, determine if this is a duplicate. Return true if it is a duplicate, false otherwise.

Consider a duplicate if image hash distance is below 5.
`,
});

const detectDuplicateMemoriesFlow = ai.defineFlow(
  {
    name: 'detectDuplicateMemoriesFlow',
    inputSchema: DetectDuplicateMemoriesInputSchema,
    outputSchema: DetectDuplicateMemoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
