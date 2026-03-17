"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DangerZone() {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmation !== "DELETE") return;
    setDeleting(true);
    setError("");

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated. Please log in again.");
        setDeleting(false);
        return;
      }

      // Delete profile row (cascades to saved_plans, chat_history, etc. via FK ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (deleteError) {
        setError(`Failed to delete account data: ${deleteError.message}`);
        setDeleting(false);
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();

      // NOTE: Full deletion of the auth.users row requires a server-side admin endpoint
      // using supabase.auth.admin.deleteUser(). The profile row deletion above cascades
      // to all user data. A server-side cleanup job should be implemented to remove
      // orphaned auth.users rows.

      // Redirect to landing page
      window.location.href = "/";
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="danger" size="sm" onClick={() => setShowDialog(true)}>
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all saved plans, chat history, and forum posts.
              Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={confirmation !== "DELETE"} loading={deleting}>
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
