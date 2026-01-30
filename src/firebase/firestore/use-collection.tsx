'use client';

import {useEffect, useState, useRef} from 'react';
import type {
  FirestoreError,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';

export type UseCollectionOptions = {
  listen: boolean;
};

const DEFAULT_OPTIONS: UseCollectionOptions = {
  listen: true,
};

export function useCollection<T = DocumentData>(
  query?: Query<T> | null,
  options?: UseCollectionOptions
) {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | undefined>(undefined);
  const optionsRef = useRef(options);
  const queryRef = useRef(query);

  useEffect(() => {
    if (query !== queryRef.current) {
      queryRef.current = query;
      setData(undefined);
      setLoading(true);
      setError(undefined);
    }
  }, [query]);

  useEffect(() => {
    const {listen} = options ?? DEFAULT_OPTIONS;
    if (!queryRef.current) {
      setData([]);
      setLoading(false);
      return;
    }
    if (!listen) {
      // Not implemented
      return;
    }
    const unsubscribe = onSnapshot(
      queryRef.current,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(undefined);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [queryRef.current, optionsRef.current]);

  return {data, loading, error};
}
