import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileData, validateProfile } from "@/lib/profile-storage";

const emptyProfile: ProfileData = {
  name: "",
  address: "",
  email: "",
  phone: "",
  birthdate: "",
  photo: null,
  education: [],
  qualifications: [],
  interests: [],
};

function toProfileData(record: {
  name: string;
  address: string;
  email: string;
  phone: string;
  birthdate: string;
  photo: string | null;
  education: unknown;
  qualifications: unknown;
  interests: unknown;
}): ProfileData {
  return {
    name: record.name,
    address: record.address,
    email: record.email,
    phone: record.phone,
    birthdate: record.birthdate,
    photo: record.photo,
    education: record.education as ProfileData["education"],
    qualifications: record.qualifications as ProfileData["qualifications"],
    interests: record.interests as ProfileData["interests"],
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json(emptyProfile);
  }

  return NextResponse.json(toProfileData(profile));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = (await req.json()) as ProfileData;
  const errors = validateProfile(data);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: { ...data },
  });

  return NextResponse.json(toProfileData(profile));
}
