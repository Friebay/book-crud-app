// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname; // Current route
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protect the /books route
  if (pathname.startsWith("/books") && !token) {
    const loginUrl = new URL("/auth/login", req.url); // Redirect to login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Continue if token exists or not accessing /books
}
