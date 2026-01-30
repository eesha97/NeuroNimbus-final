import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import UserNav from '@/components/user-nav';

export const metadata: Metadata = {
  title: 'NeuroNimbus',
  description: 'A cloud-enabled memory assistance system.',
};

import { Alegreya, Belleza, Source_Code_Pro } from 'next/font/google';

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const belleza = Belleza({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${alegreya.variable} ${belleza.variable} ${sourceCodePro.variable}`}>
      <body className="font-body antialiased">
        <Providers>

          {/* HEADER */}
          <header className="flex justify-between items-center px-6 py-3 border-b bg-white">
            <h1 className="text-xl font-bold font-headline">NeuroNimbus</h1>
            <UserNav />
          </header>

          {/* PAGE CONTENT */}
          <main className="p-6">
            {children}
          </main>

        </Providers>
      </body>
    </html>
  );
}
