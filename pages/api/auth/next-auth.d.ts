// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the id property here
      name?: string;
      email?: string;
      image?: string;
    };
  }
}