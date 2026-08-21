"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { castVote } from "@/app/actions/posts"
import { compactNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export function VoteButtons({
  postId,
  initialScore,
  initialVote,
  isAuthed,
  orientation = "vertical",
}: {
  postId: number
  initialScore: number
  initialVote: number
  isAuthed: boolean
  orientation?: "vertical" | "horizontal"
}) {
  const router = useRouter()
  const [score, setScore] = useState(initialScore)
  const [myVote, setMyVote] = useState(initialVote)
  const [, startTransition] = useTransition()

  function vote(value: 1 | -1) {
    if (!isAuthed) {
      router.push("/sign-in")
      return
    }
    // Optimistic update
    const prevVote = myVote
    const nextVote = prevVote === value ? 0 : value
    setScore((s) => s - prevVote + nextVote)
    setMyVote(nextVote)

    startTransition(async () => {
      try {
        const { score: serverScore } = await castVote(postId, value)
        setScore(serverScore)
      } catch {
        setScore((s) => s - nextVote + prevVote)
        setMyVote(prevVote)
      }
    })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-md bg-muted/50 p-0.5",
        orientation === "vertical" ? "flex-col" : "flex-row",
      )}
    >
      <button
        type="button"
        aria-label="Upvote"
        onClick={() => vote(1)}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors hover:bg-primary/15",
          myVote === 1 ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ArrowBigUp className={cn("size-5", myVote === 1 && "fill-current")} />
      </button>
      <span
        className={cn(
          "min-w-7 text-center font-mono text-xs font-semibold tabular-nums",
          myVote === 1 ? "text-primary" : myVote === -1 ? "text-destructive" : "text-foreground",
        )}
      >
        {compactNumber(score)}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        onClick={() => vote(-1)}
        className={cn(
          "flex size-7 items-center justify-center rounded transition-colors hover:bg-destructive/15",
          myVote === -1 ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <ArrowBigDown className={cn("size-5", myVote === -1 && "fill-current")} />
      </button>
    </div>
  )
}
