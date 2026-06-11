import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return { id: user.id, email: user.email, name: user.name };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // Der Credentials Provider unterstuetzt in NextAuth v4 nur JWT-Sessions.
    // Der aktuelle Zugang-Status wird stattdessen im session-Callback bei
    // jeder Anfrage live aus der Datenbank gelesen.
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) return session;

      session.user.id = token.id;

      const user = await prisma.user.findUnique({ where: { id: token.id } });
      if (user) {
        session.user.email = user.email;
        session.user.name = user.name;
      }

      return session;
    },
  },
};
