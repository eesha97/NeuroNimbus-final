export type UserRole = 'caregiver' | 'patient';

export interface User {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: number; // timestamp
  patientUid?: string; // For caregivers, the UID of the patient they are assigned to
}

export interface Memory {
  id: string;
  ownerUid: string; // caregiver UID
  patientUid: string;
  photoUrl: string;
  publicId?: string; // Cloudinary public_id for deletion
  photoHint: string;
  caption: string;
  createdAt: number; // timestamp
  event?: {
    id: string;
    title: string;
  };
  people: Pick<Person, 'id' | 'displayName' | 'faceThumbUrl' | 'faceThumbHint'>[];
  keywords: string[];
  imageHash?: string;
  duplicateStatus: 'none' | 'candidate' | 'hidden' | 'confirmed';
  processing?: {
    status: 'queued' | 'processing' | 'done' | 'error';
    errorMessage?: string;
  };
}

export interface Person {
  id: string;
  patientUid: string;
  displayName: string;
  relationshipTag?: string;
  faceThumbUrl: string;
  faceThumbHint: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface Event {
  id: string;
  patientUid: string;
  title: string;
  date?: number; // timestamp
  createdAt: number; // timestamp
  memoryCount: number;
  description?: string;
  images?: { url: string; publicId: string }[];
  imageUrls?: string[]; // Deprecated, kept for backward compatibility if needed
  coverPhotoUrl?: string;
  coverPhotoHint?: string;
}

export interface Note {
  id?: string;
  text: string;
  createdAt: number; // timestamp
}

export interface NoteSession {
  id: string;
  caregiverUid: string;
  patientUid: string;
  title: string;
  notes: Note[];
  summaryText?: string;
  summaryKeywords?: string[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
