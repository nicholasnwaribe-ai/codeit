"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { authClient, signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe2, Terminal } from "lucide-react"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

  async function continueWithGoogle() {
    setLoading(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })

    if (error) {
      toast.error("Could not continue with Google", {
        description: "Check that Google sign-in is configured for this deployment.",
      })
      console.log("[v0] Google auth error:", error.message)
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))
    const name = String(form.get("name") ?? "")

    try {
      if (isSignUp) {
        const { error } = await signUp.email({ email, password, name })
        if (error) throw new Error(error.message)
      } else {
        const { error } = await signIn.email({ email, password })
        if (error) throw new Error(error.message)
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error(isSignUp ? "Could not create account" : "Could not sign in", {
        description: "Check your details and try again.",
      })
      console.log("[v0] auth error:", (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Terminal className="size-5" />
        </span>
        <span className="font-mono text-xl font-bold tracking-tight">Codeit</span>
      </Link>

      <h1 className="text-balance font-mono text-2xl font-bold">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignUp
          ? "Join the community sharing AI-generated code."
          : "Sign in to post, vote, and comment."}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={continueWithGoogle}
          className="w-full font-medium"
        >
          <Globe2 className="size-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Username</Label>
            <Input id="name" name="name" placeholder="ada_lovelace" required minLength={2} autoComplete="username" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-2 font-medium">
          {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New to Codeit? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  )
}
