"use client"

import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react"
import Link from "next/link"
import { Calendar, SquareArrowOutUpRight, Trophy } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LeaderboardEntry } from "@/lib/types"
import { formatMoney, formatSigned } from "@/lib/format"
import { cn } from "@/lib/utils"
import { applyVegas, type VegasLeaderboardEntry } from "@/lib/vegas"
import { AnimatedMoney } from "@/components/animated-money"

/** Smooth FLIP glide for rows that just get shuffled around. */
function glideRow(el: HTMLElement, dy: number, delay = 0) {
  const anim = el.animate(
    [{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }],
    { duration: 900, delay, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "backwards" },
  )
  anim.onfinish = () => anim.cancel()
}

/** Brief color flash on a row (red for the fall, gold for the rise). */
function flashRow(el: HTMLElement, color: string, duration = 700, delay = 0) {
  const anim = el.animate(
    [{ backgroundColor: "rgba(0,0,0,0)" }, { backgroundColor: color }, { backgroundColor: "rgba(0,0,0,0)" }],
    { duration, delay, easing: "ease-out", fill: "backwards" },
  )
  anim.onfinish = () => anim.cancel()
}

/**
 * The money shot: a row hovers up off the table, hangs for a beat,
 * then slams down into its new position with an impact flash.
 */
function slamRow(el: HTMLElement, drop: number, delay = 0) {
  el.style.position = "relative"
  el.style.zIndex = "10"
  const lift = 52
  const anim = el.animate(
    [
      {
        transform: `translateY(${-drop}px)`,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        offset: 0,
      },
      {
        transform: `translateY(${-drop - lift}px) scale(1.03)`,
        boxShadow: "0 24px 36px -12px rgba(0,0,0,0.55)",
        offset: 0.3,
        easing: "cubic-bezier(0.22,1,0.36,1)",
      },
      {
        transform: `translateY(${-drop - lift}px) scale(1.03)`,
        boxShadow: "0 24px 36px -12px rgba(0,0,0,0.55)",
        offset: 0.42,
      },
      {
        transform: `translateY(7px) scale(1)`,
        boxShadow: "0 5px 12px -4px rgba(0,0,0,0.45)",
        offset: 0.78,
        easing: "cubic-bezier(0.55,0.06,0.75,0.4)",
      },
      {
        transform: `translateY(-9px)`,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        offset: 0.9,
        easing: "ease-out",
      },
      { transform: `translateY(0)`, boxShadow: "0 0 0 rgba(0,0,0,0)", offset: 1 },
    ],
    { duration: 1250, delay, fill: "backwards", easing: "ease-in-out" },
  )
  anim.onfinish = () => {
    anim.cancel()
    el.style.position = ""
    el.style.zIndex = ""
  }
  // red impact flash right as it lands
  flashRow(el, "rgba(220,38,38,0.22)", 650, delay + 1250 * 0.74)
}

/** Tiny table shudder when the first row slams down. */
function shudderTable(wrap: HTMLElement, delay: number) {
  const anim = wrap.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(4px)", offset: 0.35 },
      { transform: "translateY(-2px)", offset: 0.7 },
      { transform: "translateY(0)" },
    ],
    { duration: 300, delay, easing: "ease-in-out", fill: "backwards" },
  )
  anim.onfinish = () => anim.cancel()
}

/**
 * Animates rows when the order changes. Players with Vegas results get the
 * full treatment: losers hover up and SLAM down, the winner rises with a
 * gold flash. Everyone else just glides to their new spot.
 */
function useSlamRows(
  tbodyRef: RefObject<HTMLTableSectionElement | null>,
  tableWrapRef: RefObject<HTMLDivElement | null>,
  rowsKey: string,
  vegasMode: boolean,
  affected: Set<number>,
) {
  const prevPos = useRef(new Map<number, number>())
  const prevMode = useRef(vegasMode)

  useLayoutEffect(() => {
    const root = tbodyRef.current
    const prev = prevPos.current
    if (!root) return

    const rowEls = Array.from(root.querySelectorAll<HTMLElement>("[data-flip-key]"))
    const next = new Map<number, number>()
    for (const r of rowEls) next.set(Number(r.dataset.flipKey), r.offsetTop)

    const firstRun = prev.size === 0
    const turningOn = vegasMode && !prevMode.current
    prevPos.current = next
    prevMode.current = vegasMode
    if (firstRun) return

    let slamCount = 0
    for (const r of rowEls) {
      const key = Number(r.dataset.flipKey)
      const oldTop = prev.get(key)
      const newTop = next.get(key)
      if (oldTop === undefined || newTop === undefined || oldTop === newTop) continue

      const d = newTop - oldTop // > 0 means the row moved down
      const isAffected = affected.has(key)

      if (turningOn && isAffected && d > 0) {
        slamRow(r, d, slamCount * 140)
        slamCount++
      } else if (turningOn && isAffected && d < 0) {
        glideRow(r, -d)
        flashRow(r, "rgba(212,175,55,0.3)", 900)
      } else {
        glideRow(r, oldTop - newTop)
      }
    }

    if (turningOn && slamCount > 0 && tableWrapRef.current) {
      shudderTable(tableWrapRef.current, 1250 * 0.74)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsKey])
}

function VegasChipToggle({
  on,
  onToggle,
}: {
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-all hover:border-primary/60 hover:shadow"
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-dashed text-xl transition-transform duration-500",
          on ? "border-white bg-red-600 [transform:rotateY(180deg)]" : "border-red-600/60 bg-red-600/10",
        )}
        style={on ? { boxShadow: "0 0 24px rgba(220,38,38,0.55)" } : undefined}
      >
        🎲
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {on ? "Vegas stats included" : "Include Vegas stats"}
        </span>
        <span className="block text-xs text-muted-foreground">
          {on ? "the damage is done" : "the Vegas gods demand tribute"}
        </span>
      </span>
    </button>
  )
}

export function Leaderboard({
  entries,
  sessionCount,
  biggestPot,
}: {
  entries: LeaderboardEntry[]
  sessionCount: number
  biggestPot: number
}) {
  const [vegasMode, setVegasMode] = useState(false)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const tableWrapRef = useRef<HTMLDivElement>(null)

  const showToast = (text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }

  const rows: VegasLeaderboardEntry[] = useMemo(
    () =>
      vegasMode
        ? applyVegas(entries)
        : entries.map((e) => ({ ...e, vegasNet: 0, combinedNet: e.net })),
    [entries, vegasMode],
  )
  const netFor = (r: VegasLeaderboardEntry) => (vegasMode ? r.combinedNet : r.net)
  const affected = useMemo(
    () => new Set(rows.filter((r) => r.vegasNet !== 0).map((r) => r.player_id)),
    [rows],
  )

  useSlamRows(tbodyRef, tableWrapRef, rows.map((r) => r.player_id).join(","), vegasMode, affected)

  const leader = rows[0]

  const handleToggle = () => {
    if (!vegasMode) {
      setVegasMode(true)
      showToast("The Vegas gods have spoken. 🏛️")
    } else {
      setVegasMode(false)
      showToast("Vegas never happened. 🎲")
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">All-time standings</span>
            {vegasMode && (
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-white uppercase">
                🎲 Vegas mode
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {vegasMode
              ? "Home games + the Vegas trip. The Vegas gods have spoken. 🏛️"
              : "Lifetime results across every home game session."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <VegasChipToggle on={vegasMode} onToggle={handleToggle} />
          <Link href="/calendar" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            <Calendar className="size-4" /> View calendar
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Sessions played" value={String(sessionCount)} />
        <StatCard label="Biggest pot" value={formatMoney(biggestPot)} accent="gold" />
        <StatCard
          label="Top of the ladder"
          value={leader ? leader.name : "—"}
          sub={leader ? formatSigned(netFor(leader)) : undefined}
          subColor={leader ? (netFor(leader) >= 0 ? "win" : "loss") : undefined}
          accent="primary"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Trophy className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No results yet. Log a session to start the leaderboard.
          </p>
          <Link href="/calendar" className={cn(buttonVariants(), "mt-4")}>
            Go to calendar
          </Link>
        </div>
      ) : (
        <div ref={tableWrapRef} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">Buy-in</TableHead>
                <TableHead className="text-right">Cash-out</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody ref={tbodyRef}>
              {rows.map((entry, i) => (
                <TableRow key={entry.player_id} data-flip-key={entry.player_id}>
                  <TableCell>
                    <RankBadge rank={i + 1} />
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <span className="font-medium text-foreground">
                      {entry.name}
                      {entry.nickname ? (
                        <span className="font-normal text-muted-foreground"> “{entry.nickname}”</span>
                      ) : null}
                    </span>
                    <Link href={`/sessions?playerId=${entry.player_id}`}>
                      <SquareArrowOutUpRight className="size-3" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <AnimatedMoney
                      value={netFor(entry)}
                      className="font-semibold tabular-nums"
                    />
                    {vegasMode && entry.vegasNet !== 0 && (
                      <span className="block text-[11px] tabular-nums text-muted-foreground">
                        🎲 {formatSigned(entry.vegasNet)} in Vegas
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatMoney(entry.total_buy_in)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatMoney(entry.total_cash_out)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {entry.sessions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium whitespace-nowrap text-foreground shadow-xl"
          style={{ animation: "vegas-toast-in 0.4s ease both" }}
        >
          <style>{`@keyframes vegas-toast-in { from { opacity: 0; transform: translate(-50%, 16px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
          {toast.text}
        </div>
      )}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: "var(--gold)", color: "var(--background)" }}
      >
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted-foreground/30 text-xs font-bold text-foreground">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span
        className="inline-flex size-7 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: "color-mix(in oklch, var(--gold) 40%, var(--muted))", color: "var(--foreground)" }}
      >
        3
      </span>
    )
  }
  return (
    <span className="inline-flex size-7 items-center justify-center text-sm tabular-nums text-muted-foreground">
      {rank}
    </span>
  )
}

function StatCard({
  label,
  value,
  sub,
  subColor,
  accent,
  className,
}: {
  label: string
  value: string
  sub?: string
  subColor?: "win" | "loss"
  accent?: "gold" | "primary"
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className ?? ""}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="mt-1.5 truncate text-2xl font-bold tabular-nums"
        style={{
          color:
            accent === "gold" ? "var(--gold)" : accent === "primary" ? "var(--primary)" : "var(--foreground)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-sm font-medium tabular-nums"
          style={{
            color:
              subColor === "win" ? "var(--win)" : subColor === "loss" ? "var(--loss)" : "var(--muted-foreground)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
