'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListFilter, LoaderCircle, Search } from 'lucide-react';
import { MemoryCard } from '@/app/(app)/memories/components/memory-card';
import { MemoryDetailDialog } from '@/app/(app)/memories/components/memory-detail-dialog';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Memory } from '@/lib/types';
import { collection, orderBy, query, where, type Query } from 'firebase/firestore';

// A default patient ID for the public view.
// In a multi-patient app, this would come from the URL or another source.
const PUBLIC_PATIENT_ID = 'patient123';

export default function MemoriesPage() {
  const { profile, user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Use the logged-in caregiver's patient UID if available.
  // If not logged in (Patient View), try to get from local storage.
  // otherwise use the public default (or redirect).
  const [patientUid, setPatientUid] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.patientUid) {
      setPatientUid(profile.patientUid);
    } else {
      // Check local storage for patient login
      const storedUid = localStorage.getItem('neuro_patient_uid');
      if (storedUid) {
        setPatientUid(storedUid);
      } else {
        // If no ID found and likely supposed to be in patient view (or public), 
        // we could redirect to patient-login. 
        // For now, let's fall back to Public ID ONLY if explicitly acting as a demo, 
        // but the requirement implies we should force login.
        // setPatientUid(PUBLIC_PATIENT_ID); 
      }
    }
  }, [profile]);

  const memoriesQuery = useMemo(() => {
    if (!firestore || !patientUid) return null;

    // Base query
    let q = query(
      collection(firestore, 'memories'),
      where('patientUid', '==', patientUid),
      orderBy('createdAt', 'desc')
    );

    return q as Query<Memory>;
  }, [firestore, patientUid]);

  const { data: memories, loading, error } = useCollection<Memory>(memoriesQuery);

  const filteredMemories = useMemo(() => {
    if (!memories) return [];
    if (!searchQuery) return memories;
    return memories.filter(m =>
      (m.caption?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [memories, searchQuery]);


  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Memories
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search captions & keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ListFilter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                <DropdownMenuRadioItem value="all">
                  All
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="person" disabled>
                  Person
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="event" disabled>
                  Event
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date" disabled>
                  Date
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMemories.length > 0 ? (
            filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => setSelectedMemory(memory)}
              />
            ))
          ) : (
            <p className='col-span-full text-center text-muted-foreground'>No memories found.</p>
          )}
        </div>
      )}

      <MemoryDetailDialog
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
      />
    </div>
  );
}
