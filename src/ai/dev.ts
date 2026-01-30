import { config } from 'dotenv';
config();

import '@/ai/flows/detect-duplicate-memories.ts';
import '@/ai/flows/summarize-notes.ts';
import '@/ai/flows/extract-keywords.ts';
import '@/ai/flows/detect-people.ts';