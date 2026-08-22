import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getFeed } from "@/app/actions/posts"
import { getCommunityBySlug } from "@/app/actions/communities"
import { getCurrentUser } from "@/lib/session"
import { SiteHeader } from "@/components/site-header"
import { CommunityDetailClient } from "./community-detail-client"
import { CommunitySidebar } from "@/components/community-sidebar"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const community = await getCommunityBySlug(slug)
  if (!community) return { title: "Community not found" }
  return {
    title: `ci/${community.slug} — ${community.name} — Codeit`,
    description: community.description || `Posts in ci/${community.slug}`,
  }
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params
  const [community, posts, user] = await Promise.all([
    getCommunityBySlug(slug),
    getFeed({ communitySlug: slug, sort: "hot" }),
    getCurrentUser(),
  ])

  if (!community) notFound()

  const memberIds = user
    ? await (await import("@/app/actions/communities")).getMyCommunityIds()
    : []
  const isMember = memberIds.includes(community.id)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <CommunityDetailClient
            initialCommunity={community}
            initialPosts={posts}
            initialIsMember={isMember}
            currentUserId={user?.id ?? null}
          />
        </div>
        <CommunitySidebar />
      </main>
    </>
  )
}
