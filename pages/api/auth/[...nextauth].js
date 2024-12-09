import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          provider: 'github',
          provider_account_id: profile.id.toString()
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (user && bcrypt.compareSync(credentials.password, user.password)) {
            return {
              id: user.id,
              email: user.email,
              provider: 'credentials',
              provider_account_id: null
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account.provider === "github") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!dbUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                provider: "github",
                provider_account_id: user.id.toString()
              }
            });
          }
        } catch (error) {
          console.error("SignIn error:", error);
          return false;
        }
      }
      return true;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/",
  },
});