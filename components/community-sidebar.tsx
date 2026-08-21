import Link from "next/link"
import { Hash, Plus, Terminal } from "lucide-react"
import { getCommunities } from "@/app/actions/communities"
import { compactNumber } from "@/lib/format"
import { Button } from "@/components/ui/button"

export async function CommunitySidebar() {
  const communities = await getCommunities()
  const top = communities.slice(0, 8)

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-20 flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Terminal className="size-4" />
            </span>
            <h2 className="font-mono text-sm font-bold">About Codeit</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A community for sharing AI-generated code. Post snippets, run live demos, upvote the
            best, and remix what others build.
          </p>
          <Button asChild size="sm" className="mt-4 w-full gap-1.5">
            <Link href="/submit">
              <Plus className="size-4" />
              Create Post
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Communities
            </h2>
            <Link href="/communities" className="text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
          <ul className="flex flex-col">
            {top.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">No communities yet.</li>
            )}
            {top.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ci/${c.slug}`}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  <span className="flex size-6 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Hash className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono">ci/{c.slug}</span>
                  <span className="text-xs text-muted-foreground">
                    {compactNumber(Number(c.memberCount))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full gap-1.5 bg-transparent">
            <Link href="/communities/new">
              <Plus className="size-4" />
              New Community
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}
