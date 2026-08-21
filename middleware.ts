import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session && request.nextUrl.pathname.startsWith("/submit")) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (!session && request.nextUrl.pathname.startsWith("/communities/new")) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/submit/:path*", "/communities/new/:path*"],
}