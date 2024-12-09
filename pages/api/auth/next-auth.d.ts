// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | number;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface List {
    id: number;
    name: string;
    userId: number;
    books: Book[];
  }

  interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string;
    listId: number;
    userId: number;
  }

  interface ApiResponse {
    lists: List[];
    error?: string;
  }
}