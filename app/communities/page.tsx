import { Metadata } from "next"
import { getCommunities } from "@/app/actions/communities"
import { SiteHeader } from "@/components/site-header"
import { CommunitiesClient } from "./communities-client"
import { CommunitySidebar } from "@/components/community-sidebar"

export const metadata: Metadata = {
  title: "Communities — Codeit",
  description: "Browse all communities on Codeit. Find your favorite topics and join the conversation.",
}

export default async function CommunitiesPage() {
  const communities = await getCommunities()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <CommunitiesClient initialCommunities={communities} />
        </div>
        <CommunitySidebar />
      </main>
    </>
  )
}