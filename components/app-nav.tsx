"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Menu, Spade, Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Leaderboard", icon: Trophy },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/sessions", label: "Sessions", icon: Spade },
]

export function AppNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card/50">
      <div className="mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <Trophy className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">The Nut Ledger</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex sm:hidden items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isOpen && (
          <nav className="flex sm:hidden flex-col gap-1 pb-4 pt-2 border-t border-border/50">
            {links.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-4.5" />
                  {label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}
