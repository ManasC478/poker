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

export function Leaderboard({
  entries,
  sessionCount,
  biggestPot,
}: {
  entries: LeaderboardEntry[]
  sessionCount: number
  biggestPot: number
}) {
  const leader = entries[0]

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">All-time standings</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lifetime results across every home game session.
          </p>
        </div>
        <Link href="/calendar" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
          <Calendar className="size-4" /> View calendar
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Sessions played" value={String(sessionCount)} />
        <StatCard label="Biggest pot" value={formatMoney(biggestPot)} accent="gold" />
        <StatCard
          label="Top of the ladder"
          value={leader ? leader.name : "—"}
          sub={leader ? formatSigned(leader.net) : undefined}
          subColor={leader ? (leader.net >= 0 ? "win" : "loss") : undefined}
          accent="primary"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {entries.length === 0 ? (
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
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
            <TableBody>
              {entries.map((entry, i) => (
                <TableRow key={entry.player_id}>
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
                    <span
                      className="font-semibold tabular-nums"
                      style={{
                        color:
                          entry.net > 0 ? "var(--win)" : entry.net < 0 ? "var(--loss)" : "var(--muted-foreground)",
                      }}
                    >
                      {formatSigned(entry.net)}
                    </span>
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
