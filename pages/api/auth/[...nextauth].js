import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
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
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = await openDB();
        const user = await db.get(
          "SELECT * FROM users WHERE email = ?",
          [credentials.email]
        );

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
  pages: {
    signIn: "/auth/login", // Default login page
    signOut: "/auth/logout", // Default logout page
    error: "/auth/error", // Error page
    verifyRequest: "/auth/verify-request", // Verification email sent
    newUser: "/", // Redirect new users here
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "github") {
        const db = await openDB();

        // Check if the user exists
        const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
          user.email,
        ]);

        if (!existingUser) {
          // Insert the new GitHub user into the database
          await db.run(
            "INSERT INTO users (email, password, provider, provider_account_id) VALUES (?, ?, ?, ?)",
            [user.email, " ", "github", account.providerAccountId]
          );
        }
      }
      return true; // Allow sign-in
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // Default to base URL (e.g., "/")
    },
    async session({ session, token }) {
      session.user = { id: token.id, email: token.email };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});