import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("dockwatch-session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|api).*)",
  ],
};
