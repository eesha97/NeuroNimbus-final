
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, UploadCloud, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type SelectedImage = {
  type: 'file';
  file: File;
  previewUrl: string;
} | {
  type: 'placeholder';
  placeholderId: string;
  url: string;
  hint: string;
};

export default function UploadPage() {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [caption, setCaption] = useState('');
  
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image')) {
      setSelectedImage({
        type: 'file',
        file,
        previewUrl: URL.createObjectURL(file),
      });
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select an image file.',
      });
    }
  };

  const handleSelectPlaceholder = (placeholder: typeof PlaceHolderImages[0]) => {
    setSelectedImage({
      type: 'placeholder',
      placeholderId: placeholder.id,
      url: placeholder.imageUrl,
      hint: placeholder.imageHint,
    });
  };

  const handleUpload = async () => {
    if (!selectedImage || !user || !profile?.patientUid || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Please select an image and ensure you are logged in and assigned to a patient.',
      });
      return;
    }

    setUploading(true);

    try {
      let photoUrl = '';
      let photoHint = '';

      if (selectedImage.type === 'file') {
        const file = selectedImage.file;
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        photoUrl = data.url;
        photoHint = file.name.split('.')[0].replace(/_/g, ' '); 
      } else {
        photoUrl = selectedImage.url;
        photoHint = selectedImage.hint;
      }

      const memoryData = {
        ownerUid: user.uid,
        patientUid: profile.patientUid,
        photoUrl,
        photoHint,
        caption,
        createdAt: serverTimestamp(),
        peopleIds: [],
        keywords: [],
        duplicateStatus: 'none',
        processing: { status: 'done' }
      };

      const memoriesCol = collection(firestore, 'memories');
      await addDoc(memoriesCol, memoryData);
      
      toast({
        title: 'Memory Uploaded!',
        description: 'Your memory has been saved.',
      });

      router.push('/memories');
      
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">New Memory</h1>
        <p className="text-muted-foreground">Upload a photo and add details to create a new memory.</p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Choose an Image</CardTitle>
            <CardDescription>Select one of the default images or upload your own.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className='grid grid-cols-3 gap-2'>
              {PlaceHolderImages.slice(0, 3).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlaceholder(p)}
                  className={cn(
                    'relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all',
                    selectedImage?.type === 'placeholder' && selectedImage.placeholderId === p.id ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                  )}
                >
                  <Image src={p.imageUrl} alt={p.description} fill className='object-cover' />
                </button>
              ))}
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>

             <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="picture">Upload from your computer</Label>
                <Input id="picture" type="file" accept="image/*" className="h-auto" onChange={handleFileChange} disabled={uploading}/>
            </div>
            
            {selectedImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                <Image
                    src={selectedImage.type === 'file' ? selectedImage.previewUrl : selectedImage.url}
                    alt="Image preview"
                    fill
                    className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>2. Add Details</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Textarea id="caption" placeholder="Describe the memory..." rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} disabled={uploading}/>
                    </div>
                </CardContent>
            </Card>

            {!profile?.patientUid && user && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Patient Not Assigned</AlertTitle>
                <AlertDescription>
                  You must be assigned to a patient to upload memories. Please go to{' '}
                  <Link href="/settings" className="font-bold underline">Settings</Link> to create a demo patient.
                </AlertDescription>
              </Alert>
            )}

            <Button size="lg" className="w-full" onClick={handleUpload} disabled={uploading || !selectedImage || !profile?.patientUid}>
                {uploading ? <><LoaderCircle className='mr-2 animate-spin' /> Uploading...</> : <><UploadCloud className='mr-2' /> Upload Memory</>}
            </Button>
        </div>
      </div>
    </div>
  );
}

    