"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionDialog } from "@/components/session-dialog"
import type { Session } from "@/lib/types"
import { toDateKey, formatMoney, formatLongDate, parseDateKey } from "@/lib/format"
import SessionCard from "./session-card"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function PokerCalendar({ sessions, date }: { sessions: Session[], date: string }) {
  const today = parseDateKey(date)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string>(toDateKey(today))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDate, setDialogDate] = useState<string>(toDateKey(today))

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>()
    for (const s of sessions) {
      const list = map.get(s.date) ?? []
      list.push(s)
      map.set(s.date, list)
    }
    return map
  }, [sessions])

  const selectedSessions = sessionsByDate.get(selectedKey) ?? []

  // Build calendar grid (6 weeks).
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset)
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function openNew(dateKey: string) {
    setDialogDate(dateKey)
    setDialogOpen(true)
  }

  const todayKey = toDateKey(today)

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click any day to log a session or review the damage.
          </p>
        </div>
        <Button size="lg" onClick={() => openNew(selectedKey)} className="gap-2">
          <Plus className="size-4" /> New session
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Calendar */}
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftMonth(-1)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => {
                  setViewYear(today.getFullYear())
                  setViewMonth(today.getMonth())
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Today
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Next month"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((d) => {
              const key = toDateKey(d)
              const inMonth = d.getMonth() === viewMonth
              const daySessions = sessionsByDate.get(key) ?? []
              const isToday = key === todayKey
              const isSelected = key === selectedKey
              const dayPot = daySessions.reduce((s, x) => s + x.total_pot, 0)

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  onDoubleClick={() => openNew(key)}
                  className={[
                    "group relative flex min-h-16 flex-col items-stretch gap-1 rounded-lg border p-1.5 text-left transition-colors sm:min-h-20",
                    inMonth ? "bg-background" : "bg-transparent",
                    isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                      isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </span>
                  {daySessions.length > 0 && (
                    <div className="mt-auto flex flex-col gap-0.5">
                      <span className="truncate rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {daySessions.length === 1
                          ? formatMoney(dayPot)
                          : `${daySessions.length} games`}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Day detail */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-card-foreground text-balance">
                {formatLongDate(selectedKey)}
              </h3>
              <Button size="sm" variant="outline" onClick={() => openNew(selectedKey)} className="gap-1.5">
                <Plus className="size-3.5" /> Add
              </Button>
            </div>

            {selectedSessions.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No sessions on this day.
                <br />
                Add one to start tracking.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {selectedSessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <SessionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        dateKey={dialogDate}
      />
    </div>
  )
}

