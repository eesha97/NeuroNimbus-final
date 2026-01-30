import {
  FirebaseProvider,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';

// Primary export for Firebase hooks

export {
  FirebaseProvider,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useUser,
  useCollection,
  useDoc,
};
