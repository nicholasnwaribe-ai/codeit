"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Flame, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "hot", label: "Hot", icon: Flame },
  { value: "new", label: "New", icon: Clock },
  { value: "top", label: "Top", icon: TrendingUp },
] as const

interface FeedSortProps {
  onSortChange?: (sort: "hot" | "new" | "top") => void
  initialSort?: "hot" | "new" | "top"
}

export function FeedSort({ onSortChange, initialSort = "hot" }: FeedSortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("sort") ?? initialSort

  function setSort(value: "hot" | "new" | "top") {
    if (onSortChange) {
      onSortChange(value)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sort", value)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setSort(value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            current === value
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
