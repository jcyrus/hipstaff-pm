"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function acceptInvite() {
      if (!token) {
        setStatus("invalid");
        setMessage("No invitation token provided");
        return;
      }

      const supabase = getSupabaseClient();

      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .single();

      if (inviteError || !invite) {
        setStatus("invalid");
        setMessage("Invalid or expired invitation");
        return;
      }

      if (invite.revoked_at) {
        setStatus("invalid");
        setMessage("This invitation has been revoked");
        return;
      }

      if (invite.accepted_at) {
        setStatus("invalid");
        setMessage("This invitation has already been accepted");
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        setStatus("invalid");
        setMessage("This invitation has expired");
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("error");
        setMessage("Please sign in to accept the invitation");
        return;
      }

      const { data: userData, error: userDataError } = await supabase
        .from("users")
        .select("user_id")
        .eq("supabase_user_id", user.id)
        .single();

      if (userDataError) {
        setStatus("error");
        setMessage("Failed to fetch user data");
        return;
      }

      const { error: memberError } = await supabase.from("user_teams").insert({
        user_id: userData.user_id,
        team_id: invite.team_id,
        role: invite.role,
      });

      if (memberError) {
        setStatus("error");
        setMessage("Failed to add you to the team");
        return;
      }

      await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      setStatus("success");
      setMessage("You have been successfully added to the team!");
    }

    acceptInvite();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-dark-secondary">
        {status === "loading" && (
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Processing invitation...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Invitation Accepted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <a
              href="/"
              className="mt-6 inline-flex rounded-md bg-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        {(status === "error" || status === "invalid") && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {status === "error" ? "Error" : "Invalid Invitation"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <a
              href="/"
              className="mt-6 inline-flex rounded-md bg-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Back to Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
