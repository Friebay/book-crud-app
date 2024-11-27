import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";

const openDB = async () =>
  open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await openDB();
        const user = await db.get("SELECT * FROM users WHERE email = ?", [credentials.email]);

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, email: user.email };
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.id, email: token.email };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Add a strong secret in .env.local
});
