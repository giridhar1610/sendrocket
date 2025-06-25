import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized",
      }, { status: 401 });
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses[0].emailAddress;

    const { emails, subject, content } = await request.json();

    if (!emails?.length || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sendPromises = emails.map(async (email: string) => {
      return resend.sendEmail({
        from: userEmail || "contact@uncalledinnovators.com",
        to: email,
        subject,
        html: content,
      });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
