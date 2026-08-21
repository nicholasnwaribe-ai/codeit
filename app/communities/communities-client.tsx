"use client"

import Link from "next/link"
import { Hash, Users, FileCode, Search, Plus } from "lucide-react"
import { useState } from "react"
import { compactNumber } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Community } from "@/components/post-form"

interface CommunitiesClientProps {
  initialCommunities: Community[]
}

export function CommunitiesClient({ initialCommunities }: CommunitiesClientProps) {
  const [query, setQuery] = useState("")
  const [communities] = useState(initialCommunities)

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.slug.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">Communities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover and join communities sharing AI-generated code
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/communities/new">
            <Plus className="size-4" />
            Create Community
          </Link>
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search communities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <Hash className="size-12 text-muted-foreground/50" />
          <h2 className="mt-4 font-mono text-base font-semibold">
            {query ? "No communities match your search" : "No communities yet"}
          </h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {query
              ? "Try a different search term."
              : "Be the first to create a community!"}
          </p>
          {!query && (
            <Button asChild className="mt-5 gap-1.5">
              <Link href="/communities/new">
                <Plus className="size-4" />
                Create Community
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link
                href={`/ci/${c.slug}`}
                className="flex items-center gap-4 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Hash className="size-6 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold">ci/{c.slug}</span>
                    <span className="text-sm text-muted-foreground">{c.name}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {c.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {compactNumber(c.memberCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCode className="size-3.5" />
                    {compactNumber(c.postCount)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}