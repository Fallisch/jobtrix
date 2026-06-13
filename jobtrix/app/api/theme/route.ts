import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_PREFERENCES = ["system", "light", "dark"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ themePreference: profile?.themePreference ?? "system" });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { themePreference } = (await req.json()) as { themePreference?: string };
  if (!VALID_PREFERENCES.includes(themePreference ?? "")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, themePreference: themePreference as string },
    update: { themePreference: themePreference as string },
  });

  return NextResponse.json({ themePreference: profile.themePreference });
}
