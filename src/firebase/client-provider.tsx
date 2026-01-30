'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

type FirebaseCtx = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
};

const FirebaseContext = createContext<FirebaseCtx | null>(null);

import { firebaseConfig } from '@/lib/firebase';

function getFirebaseConfig() {
  return firebaseConfig;
}

function getClientApp() {
  const config = getFirebaseConfig();

  if (!getApps().length) {
    return initializeApp(config);
  }

  return getApp();
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const app = getClientApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    return { app, auth, firestore, storage };
  }, []);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseApp() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebaseApp must be used within FirebaseProvider');
  return ctx.app;
}

export function useAuth() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useAuth must be used within FirebaseProvider');
  return ctx.auth;
}

export function useFirestore() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirestore must be used within FirebaseProvider');
  return ctx.firestore;
}

export function useStorage() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useStorage must be used within FirebaseProvider');
  return ctx.storage;
}
