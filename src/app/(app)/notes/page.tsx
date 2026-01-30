'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Bot, Plus, Sparkles, LoaderCircle } from 'lucide-react';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { NoteSession } from '@/lib/types';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const PUBLIC_PATIENT_ID = 'patient123';

export default function NotesPage() {
  const { profile } = useUser();
  const firestore = useFirestore();
  const patientUid = profile?.patientUid || PUBLIC_PATIENT_ID;

  // Query for the most recent note session for this patient
  // For now, we'll just show the latest one to match the mock UI which showed a single session
  const sessionQuery = useMemo(() => {
    if (!firestore || !patientUid) return null;
    return query(
      collection(firestore, 'note_sessions'),
      where('patientUid', '==', patientUid),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
  }, [firestore, patientUid]);

  const { data: sessions, loading } = useCollection<NoteSession>(sessionQuery as any);
  const currentSession = sessions?.[0];

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  // Fallback if no session found - usually we would create one or show a list
  if (!currentSession) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Memory Notes</h1>
          <Button>
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            New Session
          </Button>
        </header>
        <div className="p-12 text-center border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No note sessions found. Start a new one to begin recording memory fragments.</p>
        </div>
      </div>
    );
  }

  const { title, notes, summaryText, updatedAt } = currentSession;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Memory Notes</h1>
        <Button variant="outline">
          History
        </Button>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Add fragmented notes below.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-3">
              {notes && notes.length > 0 ? notes.map((note, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-sm text-muted-foreground min-w-16 text-right">
                    {format(new Date(note.createdAt), 'h:mm a')}
                  </div>
                  <div className="flex-1 rounded-md border bg-muted/50 p-3 text-sm">{note.text}</div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground italic">No notes yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea placeholder="Type a new note..." />
              <Button size="icon" className="h-auto aspect-square">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Reconstructed Summary
            </CardTitle>
            <CardDescription>
              Last updated on {format(new Date(updatedAt), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summaryText ? (
              <div className="prose prose-lg max-w-none text-foreground font-body">
                <p>{summaryText}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No summary generated yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="secondary">
              <Bot className='mr-2 h-4 w-4' />
              Regenerate Summary
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
