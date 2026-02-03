'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../client-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User as UserProfile } from '@/lib/types';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!auth || auth.app.options.apiKey === 'dummy') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setLoading(false);
        } else {
          // No firebase user? Check for patient local login (Legacy/Mock fallback)
          const patientUid = localStorage.getItem('neuro_patient_uid');
          const patientName = localStorage.getItem('neuro_patient_name');

          if (patientUid) {
            // Create a synthetic user object for legacy support
            const mockUser = {
              uid: patientUid,
              displayName: patientName || 'Patient',
              email: null,
              photoURL: null,
              emailVerified: false,
              isAnonymous: true,
              isMock: true,
              metadata: {},
              providerData: [],
              refreshToken: '',
              tenantId: null,
              delete: async () => { },
              getIdToken: async () => '',
              getIdTokenResult: async () => ({} as any),
              reload: async () => { },
              toJSON: () => ({}),
              phoneNumber: null,
            } as unknown as User;

            setUser(mockUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user && firestore) {
      // 1. Handle Mock User (Legacy)
      if ((user as any).isMock) {
        setProfile({
          uid: user.uid,
          role: 'patient',
          displayName: user.displayName || 'Patient',
          email: '',
          createdAt: Date.now(),
          patientUid: user.uid // IMPORTANT: Set patientUid to self
        } as UserProfile);
        return;
      }

      // 2. Handle Anonymous User (Real Patient Login)
      if (user.isAnonymous) {
        const storedPatientId = localStorage.getItem('neuro_patient_uid');
        if (storedPatientId) {
          const patientDocRef = doc(firestore, 'users', storedPatientId);

          const unsubPatient = onSnapshot(patientDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              // Ensure patientUid is set to self if missing (it usually is for patients)
              setProfile({
                ...data,
                patientUid: data.patientUid || data.uid
              });
            } else {
              // Fallback if doc missing, reconstruct from local storage
              setProfile({
                uid: storedPatientId,
                role: 'patient',
                patientUid: storedPatientId, // IMPORTANT
                displayName: localStorage.getItem('neuro_patient_name') || 'Patient',
                email: '',
                createdAt: Date.now()
              });
            }
          });
          return () => unsubPatient();
        }
      }

      // 3. Handle Standard Caregiver User
      const userDocRef = doc(firestore, 'users', user.uid);

      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      }, (err) => {
        // Ignore permission errors if they happen during logout/switching
      });

      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user, firestore]);

  return { user, profile, loading, error };
}
