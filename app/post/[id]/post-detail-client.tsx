"use client"

import { useState } from "react"
import { ExternalLink, Flag, MoreHorizontal, Share2, Trash2 } from "lucide-react"
import { VoteButtons } from "@/components/vote-buttons"
import { CommentThread } from "@/components/comment-thread"
import { CodeSandbox } from "@/components/code-sandbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deletePost } from "@/app/actions/posts"
import { toast } from "sonner"
import { isRunnable, languageLabel, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { FeedPost } from "@/components/post-card"

interface PostDetailClientProps {
  initialPost: FeedPost & {
    code: string
    communityId: number
    userId: string
  }
  initialComments: Awaited<ReturnType<typeof import("@/components/comment-thread").getCommentData>>
  currentUserId: string | null
}

export function PostDetailClient({ initialPost, initialComments, currentUserId }: PostDetailClientProps) {
  const router = useRouter()
  const [post, setPost] = useState(initialPost)
  const [comments, setComments] = useState(initialComments)
  const [showCode, setShowCode] = useState(true)
  async function handleDeletePost() {
    if (!confirm("Delete this post? This cannot be undone.")) return
    try {
      await deletePost(post.id)
      toast.success("Post deleted")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Failed to delete post")
    }
  }

  const isAuthor = currentUserId === post.userId

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            href={`/ci/${post.communitySlug}`}
            className="font-mono font-medium text-foreground hover:text-primary"
          >
            ci/{post.communitySlug}
          </Link>
          <span aria-hidden>·</span>
          <Link href={`/u/${encodeURIComponent(post.authorName)}`} className="hover:underline">
            {post.authorName}
          </Link>
          <span aria-hidden>·</span>
          <span>{timeAgo(post.createdAt)} ago</span>
          {isAuthor && (
            <>
              <span aria-hidden>·</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDeletePost} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold text-pretty">{post.title}</h1>

        {post.description && (
          <p className="text-muted-foreground">{post.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {languageLabel(post.language)}
          </Badge>
          {post.aiTool && (
            <Badge variant="outline" className="text-xs">
              {post.aiTool}
            </Badge>
          )}
          {isRunnable(post.language) && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Runnable
            </span>
          )}
          {post.demoUrl && (
            <a
              href={post.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              Demo Video
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <VoteButtons
            postId={post.id}
            initialScore={Number(post.score)}
            initialVote={Number(post.myVote)}
            isAuthed={!!currentUserId}
            orientation="horizontal"
          />
          <div className="ml-4 flex items-center gap-4 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" className="gap-1.5">
              <Share2 className="size-4" />
              Share
            </Button>
            <Button variant="ghost" size="icon" className="gap-1.5">
              <Flag className="size-4" />
              Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4" role="tablist">
        <button
          role="tab"
          aria-selected={showCode}
          onClick={() => setShowCode(true)}
          className={cn(
            "px-4 py-2 font-mono text-sm font-medium border-b-2 transition-colors",
            showCode
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Code
        </button>
        <button
          role="tab"
          aria-selected={!showCode}
          onClick={() => setShowCode(false)}
          className={cn(
            "px-4 py-2 font-mono text-sm font-medium border-b-2 transition-colors",
            !showCode
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Preview
        </button>
      </div>

      {showCode ? (
        <pre className="rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto max-h-[500px]">
          <code className="font-mono text-sm">{post.code}</code>
        </pre>
      ) : (
        <CodeSandbox code={post.code} language={post.language} />
      )}

      <CommentThread postId={post.id} initialComments={comments} currentUserId={currentUserId} />
    </article>
  )
}
