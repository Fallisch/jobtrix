import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const normalizedEmail = email.toLowerCase();
  const key = `login:${normalizedEmail}`;
  if (!(await checkRateLimit(key))) return null;

  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });
  if (!user) {
    await logAudit("login_failed", { detail: `unknown_email:${normalizedEmail}` });
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    await logAudit("login_failed", { userId: user.id, detail: "wrong_password" });
    return null;
  }

  return { id: user.id, email: user.email, name: user.name };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // Der Credentials Provider unterstuetzt in NextAuth v4 nur JWT-Sessions.
    // Der aktuelle Zugang-Status wird stattdessen im session-Callback bei
    // jeder Anfrage live aus der Datenbank gelesen.
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return verifyCredentials(credentials.email, credentials.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // email/name im Token cachen, damit die Session auch bei DB-Ausfall
        // vollständig bleibt und der Nutzer nicht aus der UI fliegt.
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) return session;

      try {
        const user = await prisma.user.findUnique({ where: { id: token.id } });

        if (user?.passwordChangedAt && token.iat) {
          const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
          if (changedAtSec > (token.iat as number)) {
            return session;
          }
        }

        session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        session.user.name = (token.name as string | null) ?? null;

        if (user) {
          session.user.email = user.email;
          session.user.name = user.name;
        }
      } catch (err) {
        session.user.id = token.id;
        if (token.email) session.user.email = token.email;
        session.user.name = (token.name as string | null) ?? null;
        console.error("session callback: DB-Lookup fehlgeschlagen, behalte Session:", err);
      }

      return session;
    },
  },
};
