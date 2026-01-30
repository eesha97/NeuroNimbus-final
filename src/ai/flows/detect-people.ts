// src/ai/flows/detect-people.ts
'use server';

/**
 * @fileOverview Automatically detects and groups people in uploaded photos using facial recognition. Uses a fallback to allow manual tagging of people per memory when an external Vision API is not configured.
 *
 * - detectPeople - A function that handles the people detection process.
 * - DetectPeopleInput - The input type for the detectPeople function.
 * - DetectPeopleOutput - The return type for the detectPeople function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPeopleInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to detect people in, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectPeopleInput = z.infer<typeof DetectPeopleInputSchema>;

const DetectPeopleOutputSchema = z.object({
  peopleIds: z.array(z.string()).describe('The IDs of the people detected in the photo.'),
});
export type DetectPeopleOutput = z.infer<typeof DetectPeopleOutputSchema>;

export async function detectPeople(input: DetectPeopleInput): Promise<DetectPeopleOutput> {
  return detectPeopleFlow(input);
}

const detectPeopleFlow = ai.defineFlow(
  {
    name: 'detectPeopleFlow',
    inputSchema: DetectPeopleInputSchema,
    outputSchema: DetectPeopleOutputSchema,
  },
  async input => {
    // Placeholder implementation - replace with actual face detection logic
    // In the full implementation, this would use the Vision API if available,
    // and fall back to manual tagging otherwise.
    console.log("Running detectPeopleFlow with input:", input);

    // Return an empty array for now; the actual implementation would detect faces and return IDs.
    return {peopleIds: []};
  }
);
