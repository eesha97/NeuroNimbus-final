'use client';

import { FirebaseProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
      <Toaster />
    </FirebaseProvider>
  );
}
