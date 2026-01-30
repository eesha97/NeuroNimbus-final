'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';

export default function ProfilePage() {
  const { profile, loading } = useUser();

  if (loading) return <LoaderCircle className="animate-spin" />;
  if (!profile) return null;

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><b>Name:</b> {profile.displayName}</p>
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Role:</b> {profile.role}</p>
      </CardContent>
    </Card>
  );
}
