import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getFeed } from "@/app/actions/posts"
import { getUserProfile, getUserPosts, getUserStats } from "@/app/actions/posts"
import { getCurrentUser } from "@/lib/session"
import { SiteHeader } from "@/components/site-header"
import { UserProfileClient } from "./user-profile-client"
import { CommunitySidebar } from "@/components/community-sidebar"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getUserProfile(username)
  if (!profile) return { title: "User not found" }
  return {
    title: `u/${profile.name} — Codeit`,
    description: `Posts and activity by ${profile.name}`,
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const [profile, posts, stats, currentUser] = await Promise.all([
    getUserProfile(username),
    getUserPosts(username, "new"),
    getUserStats(username),
    getCurrentUser(),
  ])

  if (!profile) notFound()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <UserProfileClient
            initialProfile={profile}
            initialPosts={posts}
            initialStats={stats}
            currentUserId={currentUser?.id ?? null}
            isOwnProfile={currentUser?.name === username}
          />
        </div>
        <CommunitySidebar />
      </main>
    </>
  )
}