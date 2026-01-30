'use client';

import { use, useMemo } from 'react';
import { MemoryCard } from '@/app/(app)/memories/components/memory-card';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, where, orderBy, type Query } from 'firebase/firestore';
import type { Memory, Event } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const firestore = useFirestore();

  // Fetch Event Document
  const { data: event, loading: eventLoading } = useDoc<Event>(
    firestore ? (doc(firestore, 'events', eventId) as any) : null
  );

  // Fetch Memories for this Event
  const memoriesQuery = useMemo(() => {
    if (!firestore || !eventId) return null;
    return query(
      collection(firestore, 'memories'),
      where('event.id', '==', eventId), // Querying by nested object field 'event.id'
      orderBy('createdAt', 'desc')
    );
  }, [firestore, eventId]);

  const { data: eventMemories, loading: memsLoading } = useCollection<Memory>(memoriesQuery as any);

  if (eventLoading) {
    return <div className="flex h-64 items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  if (!event) {
    if (!eventLoading) return <div className="p-8 text-center">Event not found.</div>;
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight font-headline">{event.title}</h1>
        {event.date && (
          <p className="text-lg text-muted-foreground mt-1">
            {format(new Date(event.date), 'MMMM d, yyyy')}
          </p>
        )}
      </header>

      <section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {memsLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : eventMemories && eventMemories.length > 0 ? (
            eventMemories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)
          ) : (
            <p className="text-muted-foreground col-span-full">No memories found for this event.</p>
          )}
        </div>
      </section>
    </div>
  );
}
