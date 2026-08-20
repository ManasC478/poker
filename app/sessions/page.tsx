import SessionList from "@/components/session-list"
import { getSessions } from "@/lib/data"
import Page from "@/components/page"
import { FilterCondition } from "@/lib/types"
import { sessionByPlayerQueryFn } from "@/lib/db/filter/query"

export const dynamic = "force-dynamic"

export default async function SessionsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const query = await searchParams
  const conditions = []
  if (query.playerId !== undefined) {
    const playerId = Number.parseInt(query.playerId)
    const condition: FilterCondition<number, Set<number>> = {
      field: 'player_id',
      type: 'query',
      value: playerId,
      query: sessionByPlayerQueryFn
    }
    conditions.push(condition)
  }

  const sessions = await getSessions(conditions)
  sessions.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Page>
      <SessionList sessions={sessions} />
    </Page>
  )
}
