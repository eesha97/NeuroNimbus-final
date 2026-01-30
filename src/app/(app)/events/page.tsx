'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Event } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';

const PUBLIC_PATIENT_ID = 'patient123';

export default function EventsPage() {
  const { profile } = useUser();
  const firestore = useFirestore();
  const patientUid = profile?.patientUid || PUBLIC_PATIENT_ID;

  const eventsQuery = useMemo(() => {
    if (!firestore || !patientUid) return null;
    return query(
      collection(firestore, 'events'),
      where('patientUid', '==', patientUid),
      orderBy('date', 'desc')
    );
  }, [firestore, patientUid]);

  const { data: events, loading } = useCollection<Event>(eventsQuery as any);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Events</h1>
        <Button>
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Create Event
        </Button>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <Card className="overflow-hidden transition-all hover:shadow-xl group">
                  <CardHeader className="p-0">
                    <div className="relative w-full aspect-video">
                      {event.coverPhotoUrl && (
                        <Image
                          src={event.coverPhotoUrl}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          data-ai-hint={event.coverPhotoHint}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </CardHeader>
                  <CardContent className="absolute bottom-0 w-full p-4">
                    <h3 className="text-xl font-bold text-white font-headline">{event.title}</h3>
                    {event.date && (
                      <p className="text-sm text-gray-200">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                    )}
                    <p className="text-sm text-gray-300 mt-1">{event.memoryCount} {event.memoryCount === 1 ? 'memory' : 'memories'}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No events found.</p>
          )}
        </div>
      )}
    </div>
  );
}
