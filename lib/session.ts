import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function requireUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}
