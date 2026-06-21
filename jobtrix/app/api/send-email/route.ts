import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pdf } from "@react-pdf/renderer";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { ProfileData } from "@/lib/profile-storage";
import { sendApplicationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmailSchema } from "@/lib/validation-schemas";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`send-email:${session.user.id}`, 5))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 });
  }

  const raw = await req.json();
  const parsed = sendEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }
  const data = parsed.data as typeof parsed.data & { profile: ProfileData };

  try {
    const coverLetterBlob = await pdf(
      React.createElement(CoverLetterDocument, {
        coverLetter: data.coverLetter,
        profile: data.profile,
        template: data.template,
        accentColor: data.accentColor,
      }) as unknown as React.ReactElement
    ).toBlob();

    const cvBlob = await pdf(
      React.createElement(CvDocument, {
        cv: data.cv,
        profile: data.profile,
        template: data.template,
        cvStyle: data.cvStyle,
        accentColor: data.accentColor,
      }) as unknown as React.ReactElement
    ).toBlob();

    const coverLetterBase64 = Buffer.from(await coverLetterBlob.arrayBuffer()).toString("base64");
    const cvBase64 = Buffer.from(await cvBlob.arrayBuffer()).toString("base64");

    const replyTo = data.profile.email || session.user.email || "";

    const ok = await sendApplicationEmail({
      to: data.to,
      replyTo,
      subject: data.subject,
      text: data.body,
      coverLetterBase64,
      cvBase64,
      applicantName: data.profile.name,
    });

    if (!ok) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    await logAudit("email_sent", { userId: session.user.id, detail: `to:${data.to}` });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/send-email] Fehler:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
