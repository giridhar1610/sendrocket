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

export default function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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

  if (!signInLoaded || !signUpLoaded) return null; // Ensure Clerk is loaded before rendering

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate email domain
    if (!email.endsWith("@uncalledinnovators.com")) {
      setError("Only @uncalledinnovators.com email addresses are allowed");
      setIsLoading(false);
      return;
    }

    try {
      // Try sign in first
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log("Sign-in result:", result);

      if (result.status === "complete") {
        console.log("Successfully signed in, redirecting to /home");
        router.push("/home");
        return;
      } else if (result.status === "needs_first_factor") {
        setPendingVerification(true);
        setAuthType("sign-in");
        setError("Please check your email for the verification code");
        return;
      }
      setError("Please check your email for the verification code");
    } catch (err: any) {
      // If sign in fails because user doesn't exist, try sign up
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        try {
          const signUpResult = await signUp.create({
            emailAddress: email,
            password,
          });
          console.log("Sign-up result:", signUpResult);
          // Send verification code
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setPendingVerification(true);
          setAuthType("sign-up");
          setError("Please check your email for the verification code");
          return;
        } catch (signUpErr: any) {
          setError(signUpErr.errors?.[0]?.message || "Sign up failed");
        }
      } else {
        setError(
          err.errors?.[0]?.message ||
            (err instanceof Error ? err.message : "Something went wrong"),
        );
      }
    } finally {
      setIsLoading(false);
      setCode(""); // Clear the code input after submission
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authType === "sign-in") {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        console.log("Sign-in (code) result:", result);
        if (result.status === "complete") {
          console.log("Successfully signed in with code, redirecting to /home");
          router.push("/home");
        } else {
          setError("Invalid or expired code.");
        }
      } else if (authType === "sign-up") {
        const verificationResult = await signUp.attemptEmailAddressVerification(
          {
            code,
          },
        );
        console.log("Sign-up (verification) result:", verificationResult);
        if (verificationResult.status === "complete") {
          console.log(
            "Successfully signed up and verified, redirecting to /home",
          );
          await setSignUpActive({
            session: verificationResult.createdSessionId,
          });
          router.push("/home");
        } else {
          setError("Invalid or expired code.");
        }
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          (err instanceof Error ? err.message : "Failed to verify code"),
      );
    } finally {
      setIsLoading(false);
      setCode(""); // Clear the code input after submission
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setCode(e.target.value)}
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
