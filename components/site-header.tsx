import Link from "next/link"
import { Plus, Terminal } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="size-5" />
          </span>
          <span className="font-mono text-lg font-bold tracking-tight">Codeit</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Feed</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/communities">Communities</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" className="gap-1.5 font-medium">
                <Link href="/submit">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Post</span>
                </Link>
              </Button>
              <UserMenu name={user.name} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
