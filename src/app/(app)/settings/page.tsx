'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore } from '@/firebase';
import { Bot, LoaderCircle, LogOut, UserPlus, Users } from 'lucide-react';
import { doc, writeBatch, serverTimestamp, deleteField, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export default function SettingsPage() {
  const { user, profile, loading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientIdInput, setPatientIdInput] = useState('');

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  // 🚫 Not logged in state
  if (!user) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground text-lg">
          Please login to view Settings.
        </p>
      </div>
    );
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !patientName.trim()) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(firestore);
      const newPatientId = 'patient_' + Math.random().toString(36).substring(2, 10);

      // 1. Check for unique name in patient_directory
      const q = query(
        collection(firestore, 'patient_directory'),
        where('displayName', '==', patientName.trim())
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        toast({
          variant: 'destructive',
          title: 'Name Taken',
          description: 'A patient with this name already exists. Please choose a unique name.'
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Create the Patient Document (as a User with role 'patient')

      batch.set(doc(firestore, 'users', newPatientId), {
        uid: newPatientId,
        role: 'patient',
        displayName: patientName.trim(),
        email: `${newPatientId}@memory-app.local`,
        createdAt: Date.now(),
      });

      // 3. Add to Public Directory
      batch.set(doc(firestore, 'patient_directory', newPatientId), {
        uid: newPatientId,
        displayName: patientName.trim()
      });

      // 3. Add to Public Directory for ID Validation
      batch.set(doc(firestore, 'patient_directory', newPatientId), {
        uid: newPatientId,
        displayName: patientName.trim()
      });

      // 2. Link current user to this new patient
      const userRef = doc(firestore, 'users', user.uid);
      // Ensure user doc exists (fix for new users)
      if (!profile) {
        batch.set(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Caregiver',
          role: 'caregiver',
          createdAt: Date.now(),
          patientUid: newPatientId
        });
      } else {
        batch.update(userRef, { patientUid: newPatientId });
      }

      await batch.commit();
      toast({ title: 'Patient Created!', description: `You are now managing ${patientName}.` });
      setPatientName('');
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !patientIdInput.trim()) return;

    setIsSubmitting(true);
    try {
      const targetId = patientIdInput.trim();

      // Optional: Verify patient exists
      const patientRef = doc(firestore, 'users', targetId);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists() || patientSnap.data().role !== 'patient') {
        toast({ variant: 'destructive', title: 'Invalid ID', description: 'Patient not found or invalid ID.' });
        setIsSubmitting(false);
        return;
      }

      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', user.uid);

      if (!profile) {
        batch.set(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Caregiver',
          role: 'caregiver',
          createdAt: Date.now(),
          patientUid: targetId
        });
      } else {
        batch.update(userRef, { patientUid: targetId });
      }

      await batch.commit();
      toast({ title: 'Joined Patient!', description: `You have successfully joined the patient group.` });
      setPatientIdInput('');
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeavePatient = async () => {
    if (!firestore || !user) return;
    if (!confirm("Are you sure you want to leave this patient? You will need the ID to rejoin.")) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await deleteField(); // Helper won't work directly in update, need to import or use update({ field: deleteField() })

      // Correct way to delete a field in Firestore
      const batch = writeBatch(firestore);
      batch.update(userRef, {
        patientUid: deleteField()
      });

      await batch.commit();
      toast({ title: 'Left Patient', description: 'You have been unassigned.' });
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CopyId = ({ id }: { id: string }) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(id);
      toast({ description: "Patient ID copied to clipboard" });
    };

    return (
      <code
        className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold cursor-pointer hover:bg-muted/80"
        onClick={copyToClipboard}
        title="Click to copy"
      >
        {id}
      </code>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto p-4">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your patient assignment.</p>
      </header>

      {profile?.patientUid ? (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Patient
            </CardTitle>
            <CardDescription>
              you are currently managing this patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Patient ID (Share this with other caregivers)</span>
                <div className="flex items-center text-lg">
                  <CopyId id={profile.patientUid} />
                </div>
              </div>
            </div>

            <Button variant="destructive" onClick={handleLeavePatient} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Leave Patient
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Leaving allows you to create or join a different patient. It does not delete the patient data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Patient</TabsTrigger>
            <TabsTrigger value="join">Join Existing</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Patient</CardTitle>
                <CardDescription>Create a new profile for a loved one.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePatient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Grandma Smith"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !patientName.trim()}>
                    {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Patient
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join Existing Patient</CardTitle>
                <CardDescription>Enter the Patient ID to join their caregiver group.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinPatient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">Patient ID</Label>
                    <Input
                      id="id"
                      placeholder="e.g. patient_kswpb8..."
                      value={patientIdInput}
                      onChange={(e) => setPatientIdInput(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !patientIdInput.trim()}>
                    {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                    Join Patient
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
