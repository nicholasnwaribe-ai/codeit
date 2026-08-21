import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { getSession } from "@/lib/session"

export default async function SignUpPage() {
  const session = await getSession()
  if (session?.user) redirect("/")

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <AuthForm mode="sign-up" />
    </main>
  )
}
