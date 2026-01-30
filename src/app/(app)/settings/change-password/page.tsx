"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@/firebase";

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const { user, loading } = useUser();
  const auth = useAuth(); // Get auth instance from context

  const resetPassword = async () => {
    if (!user?.email) {
      console.error("Change Password: No email found for user", user);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email found for this account.",
      });
      return;
    }

    if (!auth) {
      console.error("Change Password: Auth instance missing");
      return;
    }

    try {
      console.log("Attempting to send password reset email to:", user.email);
      await sendPasswordResetEmail(auth, user.email);
      console.log("Password reset email sent successfully");
      toast({
        title: "Password reset email sent",
        description: "Check your inbox to reset your password.",
      });
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: error.message,
      });
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <Button onClick={resetPassword}>
        Send Reset Link
      </Button>
    </div>
  );
}
