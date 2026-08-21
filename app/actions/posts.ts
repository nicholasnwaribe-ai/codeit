"use server"

import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { comment, community, post, user, vote } from "@/lib/db/schema"
import { getCurrentUser, requireUser } from "@/lib/session"

export type FeedSort = "hot" | "new" | "top"

const scoreExpr = sql<number>`coalesce((select sum(${vote.value}) from ${vote} where ${vote.postId} = ${post.id}), 0)`
const commentCountExpr = sql<number>`(select count(*) from ${comment} where ${comment.postId} = ${post.id})`

function myVoteExpr(userId: string | null) {
  if (!userId) return sql<number>`0`
  return sql<number>`coalesce((select ${vote.value} from ${vote} where ${vote.postId} = ${post.id} and ${vote.userId} = ${userId}), 0)`
}

type FeedOptions = {
  sort?: FeedSort
  communitySlug?: string
  authorId?: string
}

export async function getFeed({ sort = "hot", communitySlug, authorId }: FeedOptions = {}) {
  const user = await getCurrentUser()

  const baseSelect = {
    id: post.id,
    title: post.title,
    description: post.description,
    language: post.language,
    aiTool: post.aiTool,
    demoUrl: post.demoUrl,
    communitySlug: post.communitySlug,
    authorName: post.authorName,
    createdAt: post.createdAt,
    score: scoreExpr,
    commentCount: commentCountExpr,
    myVote: myVoteExpr(user?.id ?? null),
  }

  const conditions = []
  if (communitySlug) conditions.push(eq(post.communitySlug, communitySlug))
  if (authorId) conditions.push(eq(post.userId, authorId))

  const query = db
    .select(baseSelect)
    .from(post)
    .where(conditions.length ? and(...conditions) : undefined)

  if (sort === "new") {
    query.orderBy(desc(post.createdAt))
  } else if (sort === "top") {
    query.orderBy(desc(scoreExpr), desc(post.createdAt))
  } else {
    // "hot": score decayed by age (simple ranking).
    const hotExpr = sql`(${scoreExpr} + 1) / pow((extract(epoch from (now() - ${post.createdAt})) / 3600) + 2, 1.5)`
    query.orderBy(desc(hotExpr))
  }

  return query.limit(100)
}

export async function getPost(id: number) {
  const user = await getCurrentUser()
  const [row] = await db
    .select({
      id: post.id,
      title: post.title,
      description: post.description,
      language: post.language,
      code: post.code,
      aiTool: post.aiTool,
      demoUrl: post.demoUrl,
      communityId: post.communityId,
      communitySlug: post.communitySlug,
      userId: post.userId,
      authorName: post.authorName,
      createdAt: post.createdAt,
      score: scoreExpr,
      commentCount: commentCountExpr,
      myVote: myVoteExpr(user?.id ?? null),
    })
    .from(post)
    .where(eq(post.id, id))
    .limit(1)
  return row ?? null
}

export async function createPost(formData: FormData) {
  const user = await requireUser()

  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const language = String(formData.get("language") ?? "html").trim()
  const code = String(formData.get("code") ?? "")
  const aiTool = String(formData.get("aiTool") ?? "").trim()
  const demoUrl = String(formData.get("demoUrl") ?? "").trim() || null
  const communitySlug = String(formData.get("community") ?? "").trim()

  if (title.length < 3) return { error: "Title must be at least 3 characters." }
  if (!code.trim()) return { error: "Please paste some code to share." }
  if (!communitySlug) return { error: "Please choose a community." }

  const [c] = await db.select().from(community).where(eq(community.slug, communitySlug)).limit(1)
  if (!c) return { error: "That community does not exist." }

  const [created] = await db
    .insert(post)
    .values({
      title,
      description,
      language,
      code,
      aiTool,
      demoUrl,
      communityId: c.id,
      communitySlug: c.slug,
      userId: user.id,
      authorName: user.name,
    })
    .returning({ id: post.id })

  revalidatePath("/")
  revalidatePath(`/ci/${c.slug}`)
  return { id: created.id }
}

export async function castVote(postId: number, value: 1 | -1) {
  const user = await requireUser()

  const [existing] = await db
    .select()
    .from(vote)
    .where(and(eq(vote.postId, postId), eq(vote.userId, user.id)))
    .limit(1)

  if (!existing) {
    await db.insert(vote).values({ postId, userId: user.id, value })
  } else if (existing.value === value) {
    // Clicking the same direction again removes the vote.
    await db.delete(vote).where(and(eq(vote.postId, postId), eq(vote.userId, user.id)))
  } else {
    await db
      .update(vote)
      .set({ value })
      .where(and(eq(vote.postId, postId), eq(vote.userId, user.id)))
  }

  revalidatePath("/")
  revalidatePath(`/post/${postId}`)

  const [row] = await db
    .select({ score: sql<number>`coalesce(sum(${vote.value}), 0)` })
    .from(vote)
    .where(eq(vote.postId, postId))

  return { score: Number(row?.score ?? 0) }
}

export async function deletePost(postId: number) {
  const user = await requireUser()
  await db.delete(post).where(and(eq(post.id, postId), eq(post.userId, user.id)))
  await db.delete(vote).where(eq(vote.postId, postId))
  await db.delete(comment).where(eq(comment.postId, postId))
  revalidatePath("/")
}

export async function getUserProfile(username: string) {
  const currentUser = await getCurrentUser()
  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.name, username))
    .limit(1)
  return profile ?? null
}

export async function getUserPosts(username: string, sort: FeedSort = "hot") {
  const currentUser = await getCurrentUser()
  const [profile] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.name, username))
    .limit(1)

  if (!profile) return []

  return getFeed({ sort, authorId: profile.id })
}

export async function getUserStats(username: string) {
  const [profile] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.name, username))
    .limit(1)

  if (!profile) return { postCount: 0, totalScore: 0, commentCount: 0 }

  const [postStats] = await db
    .select({
      postCount: sql<number>`count(*)`,
      totalScore: sql<number>`coalesce(sum(${scoreExpr}), 0)`,
    })
    .from(post)
    .where(eq(post.userId, profile.id))

  const [commentStats] = await db
    .select({
      commentCount: sql<number>`count(*)`,
    })
    .from(comment)
    .where(eq(comment.userId, profile.id))

  return {
    postCount: Number(postStats?.postCount ?? 0),
    totalScore: Number(postStats?.totalScore ?? 0),
    commentCount: Number(commentStats?.commentCount ?? 0),
  }
}
