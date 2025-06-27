"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HTMLAttributes, FormEvent, ChangeEvent } from "react";

type AuthFormProps = HTMLAttributes<HTMLDivElement>;

type ClerkAPIError = {
  errors?: { message: string; code?: string }[];
};

function extractErrorMessage(err: unknown): string {
  const clerkError = err as ClerkAPIError;
  if (clerkError?.errors?.[0]?.message) return clerkError.errors[0].message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export default function AuthForm({ className, ...props }: AuthFormProps) {
  const router = useRouter();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const {
    signUp,
    isLoaded: signUpLoaded,
    setActive: setSignUpActive,
  } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<"sign-in" | "sign-up">("sign-in");

  if (!signInLoaded || !signUpLoaded) return null;

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.match(/^[^@]+@uncalledinnovators\.com$/)) {
      setError("Only @uncalledinnovators.com email addresses are allowed");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        router.push("/home");
        return;
      } else if (result.status === "needs_first_factor") {
        setPendingVerification(true);
        setAuthType("sign-in");
        setError("Please check your email for the verification code");
        return;
      }
      setError("Please check your email for the verification code");
    } catch (err) {
      if (
        (err as ClerkAPIError)?.errors?.[0]?.code ===
        "form_identifier_not_found"
      ) {
        try {
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setPendingVerification(true);
          setAuthType("sign-up");
          setError("Please check your email for the verification code");
          return;
        } catch (signUpErr) {
          setError(extractErrorMessage(signUpErr));
        }
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
      setCode("");
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authType === "sign-in") {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (result.status === "complete") {
          router.push("/home");
        } else {
          setError("Invalid or expired code.");
        }
      } else {
        const verificationResult = await signUp.attemptEmailAddressVerification(
          { code },
        );
        if (verificationResult.status === "complete") {
          await setSignUpActive({
            session: verificationResult.createdSessionId,
          });
          router.push("/home");
        } else {
          setError("Invalid or expired code.");
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
      setCode("");
    }
  };

  return (
    <Card className={className} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome</CardTitle>
        <CardDescription>
          Enter your @uncalledinnovators.com email to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!pendingVerification ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@uncalledinnovators.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter verification code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter the code sent to your email"
                value={code}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCode(e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
