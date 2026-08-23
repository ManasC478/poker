import { Leaderboard } from "@/components/leaderboard"
import { getLeaderboard, getSessions } from "@/lib/data"
import Page from "@/components/page"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const { entries, sessions, biggestPot } = await getLeaderboard()

  return (
    <Page>
      <Leaderboard entries={entries} sessionCount={sessions} biggestPot={biggestPot} />
    </Page>
  )
}
