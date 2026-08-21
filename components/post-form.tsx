"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPost } from "@/app/actions/posts"
import { getCommunities } from "@/app/actions/communities"
import { toast } from "sonner"
import { LANGUAGES } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Community {
  id: number
  slug: string
  name: string
  description: string
  memberCount: number
  postCount: number
}

export function PostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("html")
  const [code, setCode] = useState("")
  const [aiTool, setAiTool] = useState("")
  const [demoUrl, setDemoUrl] = useState("")
  const [community, setCommunity] = useState("")

  async function loadCommunities() {
    const data = await getCommunities()
    setCommunities(data)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("language", language)
    formData.append("code", code)
    formData.append("aiTool", aiTool)
    formData.append("demoUrl", demoUrl)
    formData.append("community", community)

    try {
      const res = await createPost(formData)
      if (res.error) throw new Error(res.error)
      toast.success("Post created!")
      router.push(`/post/${res.id}`)
      router.refresh()
    } catch (err) {
      toast.error("Failed to create post", {
        description: (err as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {communities.length === 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          No communities exist yet. <a href="/communities/new" className="underline">Create one first</a>.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What did you build?"
          required
          minLength={3}
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="community">Community</Label>
        <Select value={community} onValueChange={setCommunity} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a community" />
          </SelectTrigger>
          <SelectContent>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                <div className="flex flex-col">
                  <span className="font-mono">ci/{c.slug}</span>
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly explain what this does…"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label} {l.runnable && "(runnable)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aiTool">AI Tool (optional)</Label>
          <Input
            id="aiTool"
            value={aiTool}
            onChange={(e) => setAiTool(e.target.value)}
            placeholder="v0, ChatGPT, Claude, Cursor…"
            list="ai-tools"
          />
          <datalist id="ai-tools">
            <option value="v0" />
            <option value="ChatGPT" />
            <option value="Claude" />
            <option value="Cursor" />
            <option value="GitHub Copilot" />
            <option value="Bolt.new" />
            <option value="Replit Agent" />
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your AI-generated code here…"
          className="font-mono min-h-[300px] resize-y"
          rows={15}
          required
          spellCheck={false}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="demoUrl">Demo Video URL (optional)</Label>
        <Input
          id="demoUrl"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          placeholder="https://your-blob-url.vercel-storage.com/..."
          type="url"
        />
        <p className="text-xs text-muted-foreground">
          Upload a short video (<25MB) using the button below, or paste a Vercel Blob URL.
        </p>
      </div>

      <DemoUpload onUpload={(url) => setDemoUrl(url)} />

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {loading ? "Posting…" : "Submit Post"}
        </Button>
      </div>
    </form>
  )
}

function DemoUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file")
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Video too large (max 25MB)")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      onUpload(data.pathname)
      toast.success("Video uploaded!")
    } catch (err) {
      toast.error("Upload failed", { description: (err as Error).message })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        type="button"
        className="gap-2"
        disabled={uploading}
        onClick={() => document.getElementById("demo-upload")?.click()}
      >
        <Loader2 className={cn("size-4", uploading && "animate-spin")} />
        {uploading ? "Uploading…" : "Upload Video"}
      </Button>
      <input
        id="demo-upload"
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}