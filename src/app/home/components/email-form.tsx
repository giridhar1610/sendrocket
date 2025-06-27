"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmailEditor from "@/components/email-editor";
import { useEmailSender } from "../hooks/use-email-sender";
import { LogoutButton } from "@/components/logout-button";

export default function EmailForm() {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const { isSending, error, setError, sendEmails } = useEmailSender();

  const handleSend = async () => {
    setError(null);

    const emailList = emails.split(",").map((email) => email.trim());
    if (!emailList.length || !subject || !content) {
      setError("Please fill in all fields");
      return;
    }

    const success = await sendEmails(emailList, subject, content);

    if (success) {
      // Clear form
      setEmails("");
      setSubject("");
      setContent("");
      setIsPreview(false);
      alert("Emails sent successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="emails">Email Addresses (comma-separated)</Label>
        <Input
          id="emails"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
          disabled={isPreview}
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject Line</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
          disabled={isPreview}
        />
      </div>

      <div>
        <Label>Email Content</Label>
        {isPreview ? (
          <div
            className="border rounded-md p-4 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <EmailEditor onChange={setContent} content={content} />
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !emails || !subject || !content}
          >
            {isSending ? "Sending..." : "Send Emails"}
          </Button>
        </div>
        <div className="ml-auto">
          <LogoutButton variant="destructive" />
        </div>
      </div>
    </div>
  );
}
