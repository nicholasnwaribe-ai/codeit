"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut, User as UserIcon } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function UserMenu({ name }: { name: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const initials = name.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="h-9 gap-2 px-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">{name}</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md" role="menu">
          <div className="px-3 py-2">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <p className="truncate font-mono text-sm font-medium">{name}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            href={`/u/${encodeURIComponent(name)}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <UserIcon className="size-4" />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
