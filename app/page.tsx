import { Leaderboard } from "@/components/leaderboard"
import { getLeaderboard, getSessions } from "@/lib/data"
import Page from "@/components/page"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const [entries, sessions] = await Promise.all([getLeaderboard(), getSessions()])
  const biggestPot = sessions.reduce((max, s) => Math.max(max, s.total_pot), 0)

  return (
    <Page>
      <Leaderboard entries={entries} sessionCount={sessions.length} biggestPot={biggestPot} />
    </Page>
  )
}
