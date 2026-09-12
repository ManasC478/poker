import type { LeaderboardEntry } from "@/lib/types"

/**
 * The Vegas trip results.
 *
 * `net` is how much the player won (+) or lost (-) in Vegas, in dollars.
 * Keyed by player name — matched case-insensitively against the leaderboard.
 *
 * 👉 MANAS: replace the placeholder numbers below with the real results.
 *    Negative = donated to the Vegas gods. Positive = living legend.
 */
export type VegasResult = {
  name: string
  net: number
}

// TODO(manas): fill in the real Vegas numbers
export const VEGAS_RESULTS: VegasResult[] = [
  { name: "Manas", net: -340 },
  { name: "Sawyer", net: -200 },
  { name: "Mihir", net: -300 },
  { name: "Justin", net: 27 },
]

const netByName = new Map(
  VEGAS_RESULTS.map((r) => [r.name.trim().toLowerCase(), r.net]),
)

/** Vegas net for a player by name. 0 if they didn't go (or broke even). */
export function vegasNetFor(name: string): number {
  return netByName.get(name.trim().toLowerCase()) ?? 0
}

export type VegasLeaderboardEntry = LeaderboardEntry & {
  /** How much this player won/lost in Vegas (0 if they didn't go). */
  vegasNet: number
  /** Home-game net + Vegas net. */
  combinedNet: number
}

/**
 * Merge Vegas results into leaderboard entries and re-sort by combined net.
 * Entries for players who didn't go to Vegas are unchanged.
 */
export function applyVegas(entries: LeaderboardEntry[]): VegasLeaderboardEntry[] {
  return entries
    .map((e) => {
      const vegasNet = vegasNetFor(e.name)
      return { ...e, vegasNet, combinedNet: e.net + vegasNet }
    })
    .sort((a, b) => b.combinedNet - a.combinedNet)
}

/** The players who lost money in Vegas, worst first. */
export function vegasLosers(): VegasResult[] {
  return VEGAS_RESULTS.filter((r) => r.net < 0).sort((a, b) => a.net - b.net)
}

/** The player(s) who came home up. Best first. */
export function vegasWinners(): VegasResult[] {
  return VEGAS_RESULTS.filter((r) => r.net > 0).sort((a, b) => b.net - a.net)
}
