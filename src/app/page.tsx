
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { LoaderCircle, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleSelectionPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in as a caregiver, redirect them to the dashboard.
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // If user is already logged in, don't render the role selection.
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Logo className="mb-6" />

      <h1 className="text-3xl font-bold mb-2">Welcome to NeuroNimbus</h1>
      <p className="text-muted-foreground mb-8">
        Please select your role to continue
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl w-full">
        {/* Patient */}
        <Link href="/patient-login">
          <Card className="p-6 text-center hover:shadow-lg">
            <CardHeader>
              <User className="mx-auto h-14 w-14 text-primary" />
              <CardTitle className="mt-4">Patient</CardTitle>
            </CardHeader>
            <CardContent>View memories and reminders</CardContent>
          </Card>
        </Link>

        {/* Caregiver */}
        <Link href="/login">
          <Card className="p-6 text-center hover:shadow-lg">
            <CardHeader>
              <Users className="mx-auto h-14 w-14 text-primary" />
              <CardTitle className="mt-4">Caregiver</CardTitle>
            </CardHeader>
            <CardContent>Login to manage patient data</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
