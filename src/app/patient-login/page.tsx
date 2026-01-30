'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { LoaderCircle, User } from 'lucide-react';

export default function PatientLoginPage() {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const firestore = useFirestore();
    const router = useRouter();
    const auth = useAuth(); // Import useAuth hook

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firestore || !patientId.trim()) return;

        setLoading(true);

        try {
            // Direct lookup by Patient ID
            const targetId = patientId.trim();
            const docRef = doc(firestore, 'patient_directory', targetId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setError('Invalid Patient ID. Please check with your caregiver.');
                setLoading(false);
                return;
            }

            const patientData = docSnap.data();



            // Ensure no conflicting firebase session exists
            if (auth) {
                await signOut(auth);
            }

            // Persist to localStorage
            localStorage.setItem('neuro_patient_uid', targetId);
            localStorage.setItem('neuro_patient_name', patientData.displayName);

            // Redirect to dashboard
            router.push('/dashboard');

        } catch (err: any) {
            console.error(err);
            if (err.code === 'permission-denied') {
                setError('Permission denied. Please ensure you are using a valid Patient ID.');
            } else {
                setError('An error occurred. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Logo className="mb-8" />

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Patient Access</CardTitle>
                    <CardDescription className="text-center">
                        Enter your Patient ID to view your memories.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="patientId">Patient ID</Label>
                            <Input
                                id="patientId"
                                placeholder="e.g. patient_..."
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button disabled={loading || !patientId.trim()} type="submit" className="w-full">
                            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Enter
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-muted-foreground text-sm">
                Caregivers, please <a href="/login" className="underline hover:text-primary">log in here</a>.
            </p>
        </div>
    );
}
