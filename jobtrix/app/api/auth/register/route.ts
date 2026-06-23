import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation-schemas";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!(await checkRateLimit(`register:${ip}`))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }
  const { email: rawEmail, password } = parsed.data;
  const email = rawEmail.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json({ error: "emailTaken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
