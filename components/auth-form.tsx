"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { signIn, signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal } from "lucide-react"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

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

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
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
