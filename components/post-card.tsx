import Link from "next/link"
import { MessageSquare, Play, Video } from "lucide-react"
import { VoteButtons } from "@/components/vote-buttons"
import { Badge } from "@/components/ui/badge"
import { isRunnable, languageLabel, timeAgo } from "@/lib/format"

export type FeedPost = {
  id: number
  title: string
  description: string
  language: string
  aiTool: string
  demoUrl: string | null
  communitySlug: string
  authorName: string
  createdAt: Date | string
  score: number
  commentCount: number
  myVote: number
}

export function PostCard({ post, isAuthed }: { post: FeedPost; isAuthed: boolean }) {
  return (
    <article className="flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40">
      <div className="pt-0.5">
        <VoteButtons
          postId={post.id}
          initialScore={Number(post.score)}
          initialVote={Number(post.myVote)}
          isAuthed={isAuthed}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            href={`/ci/${post.communitySlug}`}
            className="font-mono font-medium text-foreground hover:text-primary"
          >
            ci/{post.communitySlug}
          </Link>
          <span aria-hidden>·</span>
          <span>
            by{" "}
            <Link href={`/u/${encodeURIComponent(post.authorName)}`} className="hover:underline">
              {post.authorName}
            </Link>
          </span>
          <span aria-hidden>·</span>
          <span>{timeAgo(post.createdAt)} ago</span>
        </div>

        <Link href={`/post/${post.id}`} className="mt-1 block">
          <h2 className="text-pretty text-base font-semibold leading-snug hover:text-primary">
            {post.title}
          </h2>
        </Link>

        {post.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[11px]">
            {languageLabel(post.language)}
          </Badge>
          {post.aiTool && (
            <Badge variant="outline" className="text-[11px]">
              {post.aiTool}
            </Badge>
          )}
          {isRunnable(post.language) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <Play className="size-3 fill-current" />
              Playable
            </span>
          )}
          {post.demoUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Video className="size-3" />
              Demo
            </span>
          )}
        </div>

        <div className="mt-2">
          <Link
            href={`/post/${post.id}#comments`}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <MessageSquare className="size-4" />
            {Number(post.commentCount)} comments
          </Link>
        </div>
      </div>
    </article>
  )
}
