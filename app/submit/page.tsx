import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { SiteHeader } from "@/components/site-header"
import { SubmitClient } from "./submit-client"
import { CommunitySidebar } from "@/components/community-sidebar"

export default async function SubmitPage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <SubmitClient />
        </div>
        <CommunitySidebar />
      </main>
    </>
  )
}