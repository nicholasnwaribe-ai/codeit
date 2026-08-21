"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCommunity } from "@/app/actions/communities"
import { toast } from "sonner"
import { Loader2, Hash, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function NewCommunityClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [slug, setSlug] = useState("")

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32)
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)

    try {
      const res = await createCommunity(formData)
      if (res.error) throw new Error(res.error)
      toast.success("Community created!")
      router.push(`/ci/${res.slug}`)
      router.refresh()
    } catch (err) {
      toast.error("Failed to create community", {
        description: (err as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Hash className="size-6" />
        </div>
        <div>
          <h1 className="font-mono text-2xl font-bold">Create Community</h1>
          <p className="text-sm text-muted-foreground">
            Build a space for sharing AI-generated code around a topic you love
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Details</CardTitle>
            <CardDescription>
              Choose a name and describe what this community is about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., React Components, Python Scripts, v0 Creations"
                required
                minLength={3}
                maxLength={50}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  c/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="pl-6"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Used in URLs like <code className="font-mono">/ci/{slug}</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of code snippets belong here? What's the vibe?"
                rows={4}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="font-mono font-medium flex items-center gap-2">
            <Users className="size-4" />
            What happens next?
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              You become the creator and first member
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Others can join and post to ci/{slug || "your-community"}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Posts appear in the main feed and community page
            </li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || name.length < 3} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Hash className="size-4" />}
            {loading ? "Creating…" : "Create Community"}
          </Button>
        </div>
      </form>
    </div>
  )
}