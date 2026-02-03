'use client';

import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, BookText, Calendar, LayoutGrid, UploadCloud, Users } from 'lucide-react';

const navItems = [
    { href: '/memories', icon: LayoutGrid, label: 'Memories', description: 'View and manage all memories.' },
    { href: '/upload', icon: UploadCloud, label: 'New Memory', description: 'Add a new photo and caption.' },
    { href: '/people', icon: Users, label: 'People', description: 'Organize and view people profiles.' },
    { href: '/events', icon: Calendar, label: 'Events', description: 'Create and browse special events.' },
    { href: '/notes', icon: BookText, label: 'Notes', description: 'Take and summarize notes.' },
];

export default function DashboardPage() {
    const { user, profile } = useUser();

    if (!user) {
        return null;
    }
    const displayedNavItems = navItems.filter(item => {
        if (profile?.role === 'patient') {
            return item.href !== '/upload';
        }
        return true;
    });

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight font-headline">
                    Welcome, {profile?.displayName || user.displayName || 'Caregiver'}
                </h1>
                <div className='flex items-center gap-2 mt-2'>
                    <p className="text-lg text-muted-foreground">
                        You are logged in as a
                    </p>
                    {profile?.role && <Badge>{profile.role}</Badge>}
                </div>
            </header>

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedNavItems.map(item => (
                    <Link href={item.href} key={item.href}>
                        <Card className="group flex h-full flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <item.icon className="h-6 w-6 text-primary" />
                                    <span className='font-headline text-2xl'>{item.label}</span>
                                </CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex items-center justify-end text-sm font-medium text-primary transition-all group-hover:gap-2'>
                                    Go to {item.label} <ArrowRight className='h-4 w-4' />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </section>
        </div>
    );
}
