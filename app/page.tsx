import Link from "next/link"
import { Code2 } from "lucide-react"
import { Suspense } from "react"
import { getFeed, type FeedSort as FeedSortType } from "@/app/actions/posts"
import { CommunitySidebar } from "@/components/community-sidebar"
import { FeedSort } from "@/components/feed-sort"
import { PostCard } from "@/components/post-card"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/session"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort } = await searchParams
  const feedSort = (["hot", "new", "top"].includes(sort ?? "") ? sort : "hot") as FeedSortType
  const [posts, user] = await Promise.all([getFeed({ sort: feedSort }), getCurrentUser()])

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="font-mono text-lg font-bold">Feed</h1>
            <Suspense>
              <FeedSort />
            </Suspense>
          </div>

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
              <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Code2 className="size-6" />
              </span>
              <h2 className="mt-4 font-mono text-base font-semibold">No posts yet</h2>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Be the first to share some AI-generated code with the community.
              </p>
              <Button asChild className="mt-5">
                <Link href={user ? "/submit" : "/sign-up"}>
                  {user ? "Create the first post" : "Sign up to post"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} isAuthed={!!user} />
              ))}
            </div>
          )}
        </div>

        <CommunitySidebar />
      </main>
    </>
  )
}
