"use server"

import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { community, membership, post } from "@/lib/db/schema"
import { getCurrentUser, requireUser } from "@/lib/session"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
}

export async function createCommunity(formData: FormData) {
  const user = await requireUser()
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (name.length < 3) {
    return { error: "Community name must be at least 3 characters." }
  }

  const slug = slugify(name)
  if (!slug) {
    return { error: "Please use letters or numbers in the name." }
  }

  const existing = await db.select().from(community).where(eq(community.slug, slug)).limit(1)
  if (existing.length > 0) {
    return { error: `c/${slug} already exists.` }
  }

  const [created] = await db
    .insert(community)
    .values({
      slug,
      name,
      description,
      userId: user.id,
      creatorName: user.name,
    })
    .returning()

  // Auto-join the creator.
  await db.insert(membership).values({ communityId: created.id, userId: user.id })

  revalidatePath("/")
  revalidatePath("/communities")
  return { slug: created.slug }
}

export async function toggleMembership(communityId: number) {
  const user = await requireUser()
  const existing = await db
    .select()
    .from(membership)
    .where(and(eq(membership.communityId, communityId), eq(membership.userId, user.id)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .delete(membership)
      .where(and(eq(membership.communityId, communityId), eq(membership.userId, user.id)))
  } else {
    await db.insert(membership).values({ communityId, userId: user.id })
  }
  revalidatePath("/")
  revalidatePath("/communities")
}

export async function getCommunities() {
  const rows = await db
    .select({
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description,
      createdAt: community.createdAt,
      memberCount: sql<number>`(select count(*) from ${membership} where ${membership.communityId} = ${community.id})`,
      postCount: sql<number>`(select count(*) from ${post} where ${post.communityId} = ${community.id})`,
    })
    .from(community)
    .orderBy(desc(community.createdAt))
  return rows
}

export async function getCommunityBySlug(slug: string) {
  const [row] = await db
    .select({
      id: community.id,
      slug: community.slug,
      name: community.name,
      description: community.description,
      userId: community.userId,
      creatorName: community.creatorName,
      createdAt: community.createdAt,
      memberCount: sql<number>`(select count(*) from ${membership} where ${membership.communityId} = ${community.id})`,
      postCount: sql<number>`(select count(*) from ${post} where ${post.communityId} = ${community.id})`,
    })
    .from(community)
    .where(eq(community.slug, slug))
    .limit(1)
  return row ?? null
}

export async function getMyCommunityIds() {
  const user = await getCurrentUser()
  if (!user) return []
  const rows = await db
    .select({ communityId: membership.communityId })
    .from(membership)
    .where(eq(membership.userId, user.id))
  return rows.map((r) => r.communityId)
}
