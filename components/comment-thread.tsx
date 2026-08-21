"use client"

import { useState, FormEvent } from "react"
import { MessageSquare, Trash2, Reply, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { addComment, deleteComment, getComments } from "@/app/actions/comments"
import { getCurrentUser } from "@/lib/session"
import { timeAgo } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Comment {
  id: number
  postId: number
  parentId: number | null
  body: string
  userId: string
  authorName: string
  createdAt: Date | string
}

interface CommentThreadProps {
  postId: number
  initialComments: Comment[]
}

function CommentItem({
  comment,
  depth = 0,
  onDelete,
  isAuthed,
  currentUserId,
}: {
  comment: Comment
  depth?: number
  onDelete: (id: number) => void
  isAuthed: boolean
  currentUserId?: string
}) {
  const isAuthor = currentUserId === comment.userId

  return (
    <div
      className={cn(
        "flex gap-3 pb-4",
        depth > 0 && "pl-10 border-l border-border/50 ml-2"
      )}
    >
      <Avatar className="size-7 shrink-0">
        <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
          {comment.authorName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)} ago
          </span>
          {isAuthor && isAuthed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(comment.id)}
              className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100"
              aria-label="Delete comment"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm">{comment.body}</p>
      </div>
    </div>
  )
}

function CommentForm({
  postId,
  parentId,
  onSubmit,
}: {
  postId: number
  parentId: number | null
  onSubmit: () => void
}) {
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    try {
      const res = await addComment(new FormData(e.currentTarget))
      if (res.error) throw new Error(res.error)
      setBody("")
      onSubmit()
    } catch (err) {
      toast.error("Failed to add comment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Avatar className="size-7 shrink-0">
        <AvatarFallback className="bg-muted" />
      </Avatar>
      <div className="flex-1 flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={parentId ? "Write a reply…" : "Add a comment…"}
          className="min-h-[60px] resize-none text-sm"
          rows={2}
        />
        <div className="flex items-center justify-end gap-2">
          <Button type="submit" size="sm" disabled={loading || !body.trim()}>
            {loading ? "Posting…" : parentId ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
      <input type="hidden" name="postId" value={String(postId)} />
      {parentId && <input type="hidden" name="parentId" value={String(parentId)} />}
    </form>
  )
}

export function CommentThread({ postId, initialComments }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  async function loadUser() {
    const user = await getCurrentUser()
    setCurrentUser(user?.id ?? null)
  }

  async function handleAddComment() {
    const fresh = await getComments(postId)
    setComments(fresh)
  }

  async function handleDeleteComment(id: number) {
    if (!confirm("Delete this comment?")) return
    await deleteComment(id, postId)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const topLevel = comments.filter((c) => c.parentId === null)
  const replies = comments.filter((c) => c.parentId !== null)

  return (
    <div id="comments" className="mt-8 border-t border-border pt-8">
      <h2 className="font-mono text-lg font-bold flex items-center gap-2">
        <MessageSquare className="size-5" />
        Comments ({comments.length})
      </h2>

      <CommentForm postId={postId} parentId={null} onSubmit={handleAddComment} />

      <ul className="mt-6 flex flex-col" role="list">
        {topLevel.map((comment) => (
          <li key={comment.id} className="group">
            <CommentItem
              comment={comment}
              onDelete={handleDeleteComment}
              isAuthed={!!currentUser}
              currentUserId={currentUser ?? undefined}
            />
            {replies.filter((r) => r.parentId === comment.id).map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={1}
                onDelete={handleDeleteComment}
                isAuthed={!!currentUser}
                currentUserId={currentUser ?? undefined}
              />
            ))}
            <div className="pl-10 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs gap-1"
              >
                <Reply className="size-3.5" />
                Reply
              </Button>
            </div>
            {replyingTo === comment.id && (
              <div className="pl-10 mt-2">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onSubmit={() => {
                    setReplyingTo(null)
                    handleAddComment()
                  }}
                />
              </div>
            )}
          </li>
        ))}
        {topLevel.length === 0 && (
          <li className="py-8 text-center text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </li>
        )}
      </ul>
    </div>
  )
}

export async function getCommentData(postId: number) {
  return getComments(postId)
}