"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSession } from "@/lib/actions"
import { formatLongDate } from "@/lib/format"

export function SessionDialog({
  open,
  onClose,
  dateKey,
}: {
  open: boolean
  onClose: () => void
  dateKey: string
}) {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [startTime, setStartTime] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setError(null)
    setLocation("")
    setNotes("")
  }, [open])

  if (!open) return null

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      const res = await createSession({
        date: dateKey,
        location: location.trim() || null,
        notes: notes.trim() || null,
        start_time: startTime.trim()
      })
      if (res.error) setError(res.error)
      else if (res.id) {
        onClose()
        router.push(`/sessions/${res.id}`)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">New session</p>
            <h2 className="mt-0.5 text-lg font-semibold text-card-foreground text-balance">
              {formatLongDate(dateKey)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mike's basement"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Start time</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. $1/$2 NLH"
              className="h-20 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Create session"}
          </Button>
        </footer>
      </div>
    </div>
  )
}
