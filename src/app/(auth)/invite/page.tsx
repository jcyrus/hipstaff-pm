"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

      try {
        const res = await fetch("/api/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("You have been successfully added to the team!");
        } else if (res.status === 401) {
          setStatus("error");
          setMessage(data.message || "Please sign in to accept the invitation");
        } else {
          setStatus(res.status === 400 ? "invalid" : "error");
          setMessage(data.message || "Failed to accept invitation");
        }
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
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
