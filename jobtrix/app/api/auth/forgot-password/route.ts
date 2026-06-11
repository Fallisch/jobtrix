import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = generateResetToken(user.id);
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/de/reset-password?token=${token}`;
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    }
  }

  return NextResponse.json({ ok: true });
}
