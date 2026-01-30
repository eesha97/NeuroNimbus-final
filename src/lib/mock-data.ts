import type { Memory, Person, Event, NoteSession, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const now = Date.now();

export const mockPatient: User = {
  uid: 'patient123',
  role: 'patient',
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  photoURL: 'https://picsum.photos/seed/101/100/100',
  createdAt: now - 1000 * 60 * 60 * 24 * 30,
};

export const mockCaregiver: User = {
  uid: 'caregiver123',
  role: 'caregiver',
  displayName: 'Jane Smith',
  email: 'jane.smith@example.com',
  photoURL: 'https://picsum.photos/seed/102/100/100',
  createdAt: now - 1000 * 60 * 60 * 24 * 60,
  patientUid: 'patient123',
};

const img = (id: string) => PlaceHolderImages.find(i => i.id === id)!;

export const mockPeople: Person[] = [
  {
    id: 'person1',
    patientUid: 'patient123',
    displayName: 'Eleanor',
    relationshipTag: 'Wife',
    faceThumbUrl: img('4').imageUrl,
    faceThumbHint: img('4').imageHint,
    createdAt: now - 1000 * 60 * 60 * 24 * 365,
    updatedAt: now,
  },
  {
    id: 'person2',
    patientUid: 'patient123',
    displayName: 'Max',
    relationshipTag: 'Grandson',
    faceThumbUrl: img('8').imageUrl,
    faceThumbHint: img('8').imageHint,
    createdAt: now - 1000 * 60 * 60 * 24 * 100,
    updatedAt: now,
  },
  {
    id: 'person3',
    patientUid: 'patient123',
    displayName: 'Buddy',
    relationshipTag: 'Pet',
    faceThumbUrl: img('5').imageUrl,
    faceThumbHint: img('5').imageHint,
    createdAt: now - 1000 * 60 * 60 * 24 * 50,
    updatedAt: now,
  },
];

export const mockEvents: Event[] = [
  {
    id: 'event1',
    patientUid: 'patient123',
    title: '75th Birthday Party',
    date: now - 1000 * 60 * 60 * 24 * 10,
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    memoryCount: 1,
    coverPhotoUrl: img('2').imageUrl,
    coverPhotoHint: img('2').imageHint,
  },
  {
    id: 'event2',
    patientUid: 'patient123',
    title: 'Summer Vacation 2023',
    date: now - 1000 * 60 * 60 * 24 * 200,
    createdAt: now - 1000 * 60 * 60 * 24 * 200,
    memoryCount: 2,
    coverPhotoUrl: img('3').imageUrl,
    coverPhotoHint: img('3').imageHint,
  },
];

export const mockMemories: Memory[] = [
  {
    id: 'memory1',
    ownerUid: 'caregiver123',
    patientUid: 'patient123',
    photoUrl: img('2').imageUrl,
    photoHint: img('2').imageHint,
    caption: 'Celebrating John\'s 75th birthday with the whole family. He loved the chocolate cake!',
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    event: { id: 'event1', title: '75th Birthday Party' },
    people: [mockPeople[0], mockPeople[1]],
    keywords: ['birthday', 'family', 'cake', 'celebration'],
    duplicateStatus: 'none',
  },
  {
    id: 'memory2',
    ownerUid: 'caregiver123',
    patientUid: 'patient123',
    photoUrl: img('1').imageUrl,
    photoHint: img('1').imageHint,
    caption: 'A lovely afternoon at the park. The weather was perfect.',
    createdAt: now - 1000 * 60 * 60 * 24 * 20,
    people: [mockPeople[0]],
    keywords: ['park', 'afternoon', 'sunny'],
    duplicateStatus: 'none',
  },
  {
    id: 'memory3',
    ownerUid: 'caregiver123',
    patientUid: 'patient123',
    photoUrl: img('3').imageUrl,
    photoHint: img('3').imageHint,
    caption: 'Watching the sunset over the ocean during our summer trip. Buddy enjoyed the beach.',
    createdAt: now - 1000 * 60 * 60 * 24 * 200,
    event: { id: 'event2', title: 'Summer Vacation 2023' },
    people: [mockPeople[2]],
    keywords: ['vacation', 'beach', 'sunset', 'ocean'],
    duplicateStatus: 'candidate',
  },
  {
    id: 'memory4',
    ownerUid: 'caregiver123',
    patientUid: 'patient123',
    photoUrl: img('7').imageUrl,
    photoHint: img('7').imageHint,
    caption: 'Christmas dinner was a success. Great to have everyone together.',
    createdAt: now - 1000 * 60 * 60 * 24 * 90,
    people: [mockPeople[0], mockPeople[1]],
    keywords: ['christmas', 'dinner', 'family'],
    duplicateStatus: 'none',
  },
];

export const mockNoteSession: NoteSession = {
  id: 'notes1',
  caregiverUid: 'caregiver123',
  patientUid: 'patient123',
  title: 'Doctor\'s Visit - May 15',
  notes: [
    { text: 'Dr. Adams appointment at 2pm', createdAt: now - 1000 * 60 * 60 * 24 * 5 },
    { text: 'Discussed new medication', createdAt: now - 1000 * 60 * 60 * 24 * 5 + 10000 },
    { text: 'blood pressure was a little high', createdAt: now - 1000 * 60 * 60 * 24 * 5 + 20000 },
    { text: 'follow up in 3 months', createdAt: now - 1000 * 60 * 60 * 24 * 5 + 30000 },
    { text: 'He seemed a bit tired today', createdAt: now - 1000 * 60 * 60 * 24 * 5 + 40000 },
  ],
  summaryText: 'During the appointment with Dr. Adams at 2 PM, a new medication was discussed. John\'s blood pressure was noted to be slightly high, and he appeared tired. A follow-up visit is scheduled in three months.',
  summaryKeywords: ['Dr. Adams', 'medication', 'blood pressure', 'follow-up'],
  createdAt: now - 1000 * 60 * 60 * 24 * 5,
  updatedAt: now - 1000 * 60 * 60 * 24 * 5,
};
