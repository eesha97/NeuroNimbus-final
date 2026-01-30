"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function EditProfilePage() {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [name, setName] = useState("");

  // Load existing name
  useEffect(() => {
    if (profile?.displayName) {
      setName(profile.displayName);
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!user || !firestore) return;

    try {
      // 1️⃣ Update Firestore (database)
      await updateDoc(doc(firestore, "users", user.uid), {
        displayName: name,
      });

      // 2️⃣ Update Firebase Auth (VERY IMPORTANT)
      await updateProfile(user, {
        displayName: name,
      });

      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Button onClick={saveProfile}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
