"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import type { PlayerProfile, ProfitPoint } from "@/lib/types"
import { bioForPlayer } from "@/lib/player-bios"
import { formatMoney, formatSigned, parseDateKey } from "@/lib/format"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Carousel photos, keyed by first name (lowercase).
 *
 * Real photos live in `public/players/<name>-<n>.jpg`. Players without
 * photos yet fall back to the placeholder. To add photos for a player,
 * save them as `<name>-1.jpg` … `<name>-4.jpg` and add an entry here.
 */
const PLAYER_PHOTOS: Record<string, string[]> = {
  sawyer: ["/players/sawyer-1.jpg", "/players/sawyer-2.jpg", "/players/sawyer-3.jpg", "/players/sawyer-4.jpg"],
  atharva: ["/players/atharva-1.jpg", "/players/atharva-2.jpg", "/players/atharva-3.jpg", "/players/atharva-4.jpg"],
  mihir: ["/players/mihir-1.jpg", "/players/mihir-2.jpg", "/players/mihir-3.jpg", "/players/mihir-4.jpg"],
  ishaan: ["/players/ishaan-1.jpg", "/players/ishaan-2.jpg", "/players/ishaan-3.jpg", "/players/ishaan-4.jpg"],
  justin: ["/players/justin-1.jpg", "/players/justin-2.jpg", "/players/justin-3.jpg", "/players/justin-4.jpg"],
  rajiv: ["/players/rajiv-1.jpg", "/players/rajiv-2.jpg", "/players/rajiv-3.jpg", "/players/rajiv-4.jpg"],
  manas: ["/players/manas-1.jpg", "/players/manas-2.jpg", "/players/manas-3.jpg", "/players/manas-4.jpg"],
}

const PHOTO_PLACEHOLDERS = [
  "/placeholder-user.jpg",
  "/placeholder-user.jpg",
  "/placeholder-user.jpg",
  "/placeholder-user.jpg",
]

function photosForPlayer(name: string): string[] {
  return PLAYER_PHOTOS[name.trim().toLowerCase()] ?? PHOTO_PLACEHOLDERS
}

function shortDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PlayerProfileView({ profile }: { profile: PlayerProfile }) {
  const { player, profitHistory } = profile
  const displayName = player.nickname ?? player.name
  const bio = bioForPlayer(player.name, player.description)

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to leaderboard
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {player.name}
          {player.nickname ? (
            <span className="font-normal text-muted-foreground"> “{player.nickname}”</span>
          ) : null}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Squad sessions only — the same games as the leaderboard.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Net profit" value={formatSigned(profile.net)} win={profile.net > 0} loss={profile.net < 0} />
        <StatCard label="Squad sessions" value={String(profile.sessions)} />
        <StatCard label="Total buy-in" value={formatMoney(profile.total_buy_in)} />
        <StatCard label="Total cash-out" value={formatMoney(profile.total_cash_out)} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <PhotoCarousel playerName={player.name} photos={photosForPlayer(player.name)} />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-card-foreground">About {displayName}</h2>
          {bio ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {bio.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No bio yet.</p>
          )}
        </section>
      </div>

      <ProfitGraph points={profitHistory} playerName={player.name} />
    </div>
  )
}

function PhotoCarousel({ playerName, photos }: { playerName: string; photos: string[] }) {
  const [index, setIndex] = useState(0)
  const total = photos.length
  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/5] bg-muted">
        <img
          src={photos[index]}
          alt={`${playerName} — photo ${index + 1} of ${total}`}
          className="size-full object-contain"
        />
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow transition-colors hover:bg-background"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow transition-colors hover:bg-background"
        >
          <ChevronRight className="size-5" />
        </button>
        <span className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          {index + 1} / {total}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5 p-3">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`size-2 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Cumulative Squad net over time, as a plain SVG line chart (no new
 * dependency — the repo has no chart library). One point per Squad
 * session the player played in, oldest first; hovering a point shows
 * that night's result and the running total.
 */
function ProfitGraph({ points, playerName }: { points: ProfitPoint[]; playerName: string }) {
  const [hover, setHover] = useState<number | null>(null)

  const chart = useMemo(() => {
    if (points.length === 0) return null
    const W = 720
    const H = 260
    const padX = 48
    const padY = 24
    const values = points.map((p) => p.cumulative)
    const min = Math.min(0, ...values)
    const max = Math.max(0, ...values)
    const span = max - min || 1
    const x = (i: number) =>
      points.length === 1 ? W / 2 : padX + (i / (points.length - 1)) * (W - padX * 2)
    const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2)
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.cumulative).toFixed(1)}`).join(" ")
    const area = `${line} L${x(points.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`
    return { W, H, x, y, line, area, min, max, zeroY: y(0) }
  }, [points])

  const hovered = hover !== null ? points[hover] : null

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Net profit over time</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cumulative net across Squad sessions only — the same sessions as the leaderboard.
          </p>
        </div>
        {points.length > 0 && (
          <p
            className="text-xl font-bold tabular-nums"
            style={{
              color:
                points[points.length - 1].cumulative > 0
                  ? "var(--win)"
                  : points[points.length - 1].cumulative < 0
                    ? "var(--loss)"
                    : "var(--muted-foreground)",
            }}
          >
            {formatSigned(points[points.length - 1].cumulative)}
          </p>
        )}
      </div>

      {chart === null ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {playerName} hasn&apos;t played a Squad session yet — the graph appears after their first one.
        </p>
      ) : (
        <>
          <div className="relative mt-4">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              className="w-full"
              role="img"
              aria-label={`Cumulative net over time for ${playerName}`}
            >
              <line
                x1={chart.x(0)}
                y1={chart.zeroY}
                x2={chart.x(points.length - 1)}
                y2={chart.zeroY}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <path d={chart.area} fill="var(--primary)" fillOpacity={0.08} />
              <path d={chart.line} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle
                  key={p.session_id}
                  cx={chart.x(i)}
                  cy={chart.y(p.cumulative)}
                  r={hover === i ? 6 : 4}
                  fill="var(--background)"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                >
                  <title>{`${shortDate(p.date)}: ${formatSigned(p.net)} that night, ${formatSigned(p.cumulative)} total`}</title>
                </circle>
              ))}
              <text x={8} y={chart.y(chart.max) + 4} fontSize={11} fill="var(--muted-foreground)">
                {formatMoney(chart.max)}
              </text>
              <text x={8} y={chart.y(chart.min) + 4} fontSize={11} fill="var(--muted-foreground)">
                {formatMoney(chart.min)}
              </text>
              <text x={chart.x(0)} y={chart.H - 4} fontSize={11} fill="var(--muted-foreground)">
                {shortDate(points[0].date)}
              </text>
              <text x={chart.x(points.length - 1)} y={chart.H - 4} fontSize={11} textAnchor="end" fill="var(--muted-foreground)">
                {shortDate(points[points.length - 1].date)}
              </text>
            </svg>
            {hovered && (
              <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs shadow-lg">
                <span className="font-medium text-foreground">{shortDate(hovered.date)}</span>
                <span className="text-muted-foreground"> · {formatSigned(hovered.net)} that night · </span>
                <span className="font-medium text-foreground">{formatSigned(hovered.cumulative)} total</span>
              </div>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">That night</TableHead>
                  <TableHead className="text-right">Running total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...points].reverse().map((p) => (
                  <TableRow key={p.session_id}>
                    <TableCell>
                      <Link href={`/sessions/${p.session_id}`} className="font-medium text-foreground hover:text-blue-600">
                        {shortDate(p.date)}
                      </Link>
                    </TableCell>
                    <TableCell
                      className="text-right tabular-nums"
                      style={{ color: p.net > 0 ? "var(--win)" : p.net < 0 ? "var(--loss)" : "var(--muted-foreground)" }}
                    >
                      {formatSigned(p.net)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums text-foreground">
                      {formatSigned(p.cumulative)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  win,
  loss,
}: {
  label: string
  value: string
  win?: boolean
  loss?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="mt-1.5 text-2xl font-bold tabular-nums"
        style={{
          color: win ? "var(--win)" : loss ? "var(--loss)" : "var(--foreground)",
        }}
      >
        {value}
      </p>
    </div>
  )
}
