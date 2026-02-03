'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, UploadCloud, X, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NewEventPage() {
    const { user, profile } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => file.type.startsWith('image/'));

            if (validFiles.length !== files.length) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid File Type',
                    description: 'Some files were skipped. Please upload only images.',
                });
            }

            setSelectedFiles(prev => [...prev, ...validFiles]);

            // Create preview URLs
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateEvent = async () => {
        if (!title || !date || !user || !profile?.patientUid || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a title, date, and ensure you are logged in.',
            });
            return;
        }

        setUploading(true);

        try {
            const uploadedImages: { url: string; publicId: string }[] = [];

            // Upload images sequentially
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                const data = await response.json();
                // Fallback for publicId if API update wasn't instant or cached
                uploadedImages.push({
                    url: data.url,
                    publicId: data.publicId || ''
                });
            }

            const eventData = {
                patientUid: profile.patientUid,
                title,
                date: new Date(date).getTime(),
                description,
                images: uploadedImages,
                coverPhotoUrl: uploadedImages.length > 0 ? uploadedImages[0].url : null,
                memoryCount: uploadedImages.length,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(firestore, 'events'), eventData);

            toast({
                title: 'Event Created',
                description: 'The special event has been successfully added.',
            });

            router.push('/events');

        } catch (error: any) {
            console.error("Error creating event:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to create event.',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Add Special Event</h1>
                <p className="text-muted-foreground">Record a significant life event to share.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Tell us about the event.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Grandma's 80th Birthday"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="relative">
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What happened at this event? Who was there?"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Photos</CardTitle>
                    <CardDescription>Add photos from this event.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="photos">Upload Photos</Label>
                        <Input
                            id="photos"
                            type="file"
                            accept="image/*"
                            multiple
                            className="h-auto"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </div>

                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <div className="relative w-full h-full overflow-hidden rounded-md border">
                                        <Image
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        disabled={uploading}
                                        title="Remove image"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild disabled={uploading}>
                    <Link href="/events">Cancel</Link>
                </Button>
                <Button className="flex-1" onClick={handleCreateEvent} disabled={uploading}>
                    {uploading ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Calendar className="mr-2 h-4 w-4" />
                            Save Event
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
