"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Leaderboard", icon: Trophy },
  { href: "/calendar", label: "Calendar", icon: Calendar },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Trophy className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">The Nut Ledger</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
