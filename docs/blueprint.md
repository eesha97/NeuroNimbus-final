# **App Name**: NeuroNimbus

## Core Features:

- Memory Feed: Display a feed of memories with photos, captions, keywords, dates, and related people/events. Includes search and filtering capabilities.
- Memory Upload: Caregiver upload flow for photos and captions. Displays processing status during upload (detecting people, checking duplicates, extracting keywords).
- Automated People Grouping: Automatically group detected faces into people profiles. Provides a fallback that allows manual tagging if external service not configured. If external service is configured, people profiles can be created automatically, where the profiles will also be associated with relationship tags and lists of memories associated to people
- Duplicate Memory Detection: Detect near-duplicate memories using image hashing. The image hashing component should serve as a tool in an LLM. Mark potential duplicates and allow caregivers to confirm/hide duplicates.
- Keyword Extraction: Extract keywords from memory captions using a fallback algorithm (stopword removal, noun detection). Optional enhancement: If OpenAI/Vertex key exists, use it; otherwise fallback.
- Hierarchical Organization: Organize memories by People and Events, enabling easy browsing through profiles and event-specific collections.
- Text-note Memory Reconstruction: Transform fragmented text notes into readable summaries using a fallback summarizer when an LLM API key is not available; If available, the fallback should be incorporated as a tool for the LLM. The fallback includes extractive summarization to highlight key points.
- Firestore integration: Integrate all relevant core features and backend capabilities with Firestore DB. Use it for: metadata + relationships + indexes

## Style Guidelines:

- Primary color: Calm light-blue (#A0D2EB) to create a serene and supportive atmosphere, promoting focus and reducing cognitive strain.
- Background color: Very light blue (#F0F8FF), creating a soft and unobtrusive backdrop to ease visual processing.
- Accent color: Muted violet (#B19CD9), selected to provide gentle highlights and signify interactive elements without overwhelming the user.
- Headline font: 'Belleza' (sans-serif), suitable for headlines and short chunks of text. Body font: 'Alegreya' (serif), will create a warm feeling for longer pieces of text. 
- Code font: 'Source Code Pro' for displaying code snippets.
- Use clear, high-contrast icons to represent actions and categories, enhancing recognition and minimizing confusion.
- Employ a simple, grid-based layout with ample spacing to reduce cognitive load and improve content scanning.
- Use subtle, non-distracting animations for transitions and feedback to avoid causing disorientation or frustration.