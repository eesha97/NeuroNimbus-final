'use client';

import {useEffect, useState, useRef} from 'react';
import type {
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';

export type UseDocOptions = {
  listen: boolean;
};

const DEFAULT_OPTIONS = {
  listen: true,
};

export function useDoc<T>(
  ref?: DocumentReference<T> | null,
  options?: UseDocOptions
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | undefined>(undefined);
  const optionsRef = useRef(options);
  const refRef = useRef(ref);

  useEffect(() => {
    if (ref !== refRef.current) {
      refRef.current = ref;
      setData(undefined);
      setLoading(true);
      setError(undefined);
    }
  }, [ref]);

  useEffect(() => {
    const {listen} = options ?? DEFAULT_OPTIONS;
    if (!refRef.current) {
      setData(undefined);
      setLoading(false);
      return;
    }
    if (!listen) {
      // Not implemented
      return;
    }
    const unsubscribe = onSnapshot(
      refRef.current,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          const d = snapshot.data();
          setData(d);
        } else {
          setData(undefined);
        }
        setLoading(false);
        setError(undefined);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [refRef.current, optionsRef.current]);

  return {data, loading, error};
}
