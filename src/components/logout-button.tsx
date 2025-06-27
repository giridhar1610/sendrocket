import { SignOutButton } from "@clerk/nextjs";
import { Button, buttonVariants } from "@/components/ui/button";

export function LogoutButton({
  variant = "outline",
}: {
  variant?:
    | "outline"
    | "destructive"
    | "link"
    | "default"
    | "secondary"
    | "ghost";
}) {
  return (
    <SignOutButton redirectUrl="/auth/login">
      <Button variant={variant}>Sign Out</Button>
    </SignOutButton>
  );
}
