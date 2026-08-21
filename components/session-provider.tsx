"use client"

import { SessionProvider as AuthSessionProvider } from "better-auth/react"
import { ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>
}