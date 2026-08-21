"use server"

import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { comment } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"

export async function getComments(postId: number) {
  return db
    .select()
    .from(comment)
    .where(eq(comment.postId, postId))
    .orderBy(asc(comment.createdAt))
}

export async function addComment(formData: FormData) {
  const user = await requireUser()
  const postId = Number(formData.get("postId"))
  const body = String(formData.get("body") ?? "").trim()
  const parentIdRaw = formData.get("parentId")
  const parentId = parentIdRaw ? Number(parentIdRaw) : null

  if (!postId) return { error: "Missing post." }
  if (!body) return { error: "Comment cannot be empty." }

  await db.insert(comment).values({
    postId,
    parentId,
    body,
    userId: user.id,
    authorName: user.name,
  })

  revalidatePath(`/post/${postId}`)
  return { ok: true }
}

export async function deleteComment(commentId: number, postId: number) {
  const user = await requireUser()
  await db.delete(comment).where(and(eq(comment.id, commentId), eq(comment.userId, user.id)))
  revalidatePath(`/post/${postId}`)
}
