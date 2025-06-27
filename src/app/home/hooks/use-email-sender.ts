"use client";

import { useState } from "react";

export function useEmailSender() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmails = async (
    emails: string[],
    subject: string,
    content: string,
  ) => {
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, subject, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send emails");
      }
      return true; // success
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false; // failure
    } finally {
      setIsSending(false);
    }
  };

  return { isSending, error, setError, sendEmails };
}
