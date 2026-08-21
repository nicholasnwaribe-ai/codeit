"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Users, FileCode } from "lucide-react"
import { toggleMembership } from "@/app/actions/communities"
import { getFeed } from "@/app/actions/posts"
import { PostCard } from "@/components/post-card"
import { FeedSort } from "@/components/feed-sort"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { compactNumber, timeAgo } from "@/lib/format"
import { toast } from "sonner"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

interface Community {
  id: number
  slug: string
  name: string
  description: string
  userId: string
  creatorName: string
  createdAt: Date | string
  memberCount: number
  postCount: number
}

interface CommunityDetailClientProps {
  initialCommunity: Community
  initialPosts: Awaited<ReturnType<typeof getFeed>>
  initialIsMember: boolean
  currentUserId: string | null
}

export function CommunityDetailClient({
  initialCommunity,
  initialPosts,
  initialIsMember,
  currentUserId,
}: CommunityDetailClientProps) {
  const router = useRouter()
  const [community, setCommunity] = useState(initialCommunity)
  const [posts, setPosts] = useState(initialPosts)
  const [isMember, setIsMember] = useState(initialIsMember)
  const [sort, setSort] = useState<"hot" | "new" | "top">("hot")
  const [loading, setLoading] = useState(false)

  async function handleJoinLeave() {
    setLoading(true)
    try {
      await toggleMembership(community.id)
      setIsMember(!isMember)
      setCommunity((c) => ({
        ...c,
        memberCount: isMember ? c.memberCount - 1 : c.memberCount + 1,
      }))
      toast.success(isMember ? "Left community" : "Joined community!")
    } catch {
      toast.error("Failed to update membership")
    } finally {
      setLoading(false)
    }
  }

  async function handleSortChange(newSort: "hot" | "new" | "top") {
    setSort(newSort)
    const fresh = await getFeed({ communitySlug: community.slug, sort: newSort })
    setPosts(fresh)
  }

  const isCreator = currentUserId === community.userId

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-mono text-xl font-bold">ci/</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-2xl font-bold">ci/{community.slug}</h1>
                <span className="text-sm text-muted-foreground">{community.name}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Created by{" "}
                <Link href={`/u/${encodeURIComponent(community.creatorName)}`} className="hover:underline">
                  {community.creatorName}
                </Link>
                <span aria-hidden>·</span>
                {timeAgo(community.createdAt)} ago
              </p>
              {community.description && (
                <p className="mt-2 text-sm">{community.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUserId && (
              <Button
                onClick={handleJoinLeave}
                disabled={loading}
                variant={isMember ? "outline" : "default"}
                className="gap-1.5"
              >
                {isMember ? (
                  <>
                    <Users className="size-4" />
                    Joined
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Join
                  </>
                )}
              </Button>
            )}
            {!currentUserId && (
              <Button variant="outline" asChild className="gap-1.5">
                <Link href="/sign-in">
                  <Users className="size-4" />
                  Join
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {compactNumber(community.memberCount)} members
          </span>
          <span className="flex items-center gap-1">
            <FileCode className="size-3.5" />
            {compactNumber(community.postCount)} posts
          </span>
          {isCreator && (
            <Badge variant="secondary" className="font-mono text-xs">
              Creator
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-mono text-lg font-bold">Posts</h2>
        <Suspense fallback={<FeedSort />}>
          <FeedSort onSortChange={handleSortChange} />
        </Suspense>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileCode className="size-6" />
          </span>
          <h3 className="mt-4 font-mono text-base font-semibold">No posts yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Be the first to share AI-generated code in ci/{community.slug}
          </p>
          <Button asChild className="mt-5 gap-1.5">
            <Link href="/submit">
              <Plus className="size-4" />
              Create Post
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} isAuthed={!!currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}