import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ContactMailError,
  getContactRecipientEmail,
  isMailConfigured,
  sendContactEmails,
} from "@/lib/mail";

export const runtime = "nodejs";

const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  subject: z.string().trim().min(3, "Subject is required").max(160),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured yet. Set SMTP_HOST or SMTP_URL on the server.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await sendContactEmails(parsed.data);

    return NextResponse.json({
      success: true,
      recipient: getContactRecipientEmail(),
      acknowledgementSent: true,
      message: "Your message has been sent. We have emailed you a confirmation.",
      ...result,
    });
  } catch (error) {
    if (error instanceof ContactMailError && error.stage === "acknowledgement") {
      return NextResponse.json(
        {
          success: true,
          recipient: getContactRecipientEmail(),
          acknowledgementSent: false,
          businessMessageId: error.businessMessageId,
          message:
            "Your message reached Ketronics, but the acknowledgement email could not be sent.",
        },
        { status: 207 },
      );
    }

    console.error("Contact form delivery failed:", error);
    return NextResponse.json(
      { error: "We could not send your message. Please try again shortly." },
      { status: 502 },
    );
  }
}
