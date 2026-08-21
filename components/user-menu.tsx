"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User as UserIcon } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu({ name }: { name: string }) {
  const router = useRouter()
  const initials = name.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <span className="text-xs text-muted-foreground">Signed in as</span>
          <p className="truncate font-mono text-sm font-medium">{name}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/u/${encodeURIComponent(name)}`}>
            <UserIcon className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
