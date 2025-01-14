// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("authToken");

  // If no token is found, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next(); // Proceed if the token exists
}

// Protect specific routes
export const config = {
  matcher: [
    "/biobank-dashboard",
    "/registrationadmin-dashboard", 
    "/user-dashboard", 
    "/organization-dashboard", 
    "/collectionsite-dashboard",
  ],
};
