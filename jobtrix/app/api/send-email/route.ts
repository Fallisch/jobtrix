import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pdf } from "@react-pdf/renderer";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { ProfileData } from "@/lib/profile-storage";

interface SendEmailBody {
  to: string;
  subject: string;
  body: string;
  coverLetter: string;
  cv: string;
  profile: ProfileData;
  template: "classic" | "modern" | "traditional" | "accent" | "creative";
  cvStyle: "classic" | "american";
  accentColor?: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 500 });
  }

  const data = (await req.json()) as SendEmailBody;

  if (!data.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) {
    return NextResponse.json({ error: "invalid_recipient" }, { status: 400 });
  }

  try {
    const coverLetterBlob = await pdf(
      React.createElement(CoverLetterDocument, {
        coverLetter: data.coverLetter,
        profile: data.profile,
        template: data.template,
        accentColor: data.accentColor,
      })
    ).toBlob();

    const cvBlob = await pdf(
      React.createElement(CvDocument, {
        cv: data.cv,
        profile: data.profile,
        template: data.template,
        cvStyle: data.cvStyle,
        accentColor: data.accentColor,
      })
    ).toBlob();

    const coverLetterBase64 = Buffer.from(await coverLetterBlob.arrayBuffer()).toString("base64");
    const cvBase64 = Buffer.from(await cvBlob.arrayBuffer()).toString("base64");

    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "noreply@jobtrix.app";

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: "JobTRIX" },
        to: [{ email: data.to }],
        replyTo: { email: data.profile.email || session.user.email || senderEmail },
        subject: data.subject,
        textContent: data.body,
        attachment: [
          { content: coverLetterBase64, name: "anschreiben.pdf" },
          { content: cvBase64, name: "lebenslauf.pdf" },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/send-email] Fehler:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
