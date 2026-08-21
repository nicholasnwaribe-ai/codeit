"use client"

import { useState } from "react"
import Link from "next/link"
import { Code2, MessageSquare, Award, Settings } from "lucide-react"
import { PostCard } from "@/components/post-card"
import { FeedSort } from "@/components/feed-sort"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { compactNumber, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: Date | string
}

interface UserStats {
  postCount: number
  totalScore: number
  commentCount: number
}

interface UserProfileClientProps {
  initialProfile: UserProfile
  initialPosts: Awaited<ReturnType<typeof import("@/app/actions/posts").getFeed>>
  initialStats: UserStats
  currentUserId: string | null
  isOwnProfile: boolean
}

export function UserProfileClient({
  initialProfile,
  initialPosts,
  initialStats,
  currentUserId,
  isOwnProfile,
}: UserProfileClientProps) {
  const [profile] = useState(initialProfile)
  const [posts, setPosts] = useState(initialPosts)
  const [stats] = useState(initialStats)
  const [sort, setSort] = useState<"hot" | "new" | "top">("new")

  async function handleSortChange(newSort: "hot" | "new" | "top") {
    setSort(newSort)
    const fresh = await import("@/app/actions/posts").then((m) =>
      m.getFeed({ authorId: profile.id, sort: newSort })
    )
    setPosts(fresh)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-20 shrink-0">
              {profile.image ? (
                <AvatarImage src={profile.image} alt={profile.name} />
              ) : (
                <AvatarFallback className="text-2xl font-mono font-bold bg-primary/20 text-primary">
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-2xl font-bold">
                  u/{profile.name}
                </h1>
                {isOwnProfile && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                      <Settings className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Member since {timeAgo(profile.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Code2 className="size-4" />
              <span className="font-mono font-semibold">{compactNumber(stats.postCount)}</span>
              <span>posts</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <span className="font-mono font-semibold">{compactNumber(stats.commentCount)}</span>
              <span>comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="size-4" />
              <span className="font-mono font-semibold">{compactNumber(stats.totalScore)}</span>
              <span>karma</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-mono text-lg font-bold">Posts</h2>
        <FeedSort onSortChange={handleSortChange} initialSort={sort} />
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <Code2 className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-mono text-base font-semibold">No posts yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {isOwnProfile
              ? "Share your first AI-generated code snippet!"
              : "This user hasn't posted anything yet."}
          </p>
          {isOwnProfile && (
            <Button asChild className="mt-5 gap-1.5">
              <Link href="/submit">
                <Code2 className="size-4" />
                Create Post
              </Link>
            </Button>
          )}
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