import SessionList from "@/components/session-list"
import { getPlayers, getSessions } from "@/lib/data"
import Page from "@/components/page"
import { FilterCondition, SessionFilter as SessionFilterT } from "@/lib/types"
import { sessionByPlayerQueryFn } from "@/lib/db/filter/query"
import SessionFilter from "@/components/session-filter"
import { sessionLockedBuilder } from "@/lib/db/filter/builder"

export const dynamic = "force-dynamic"

const DEFAULT_FILTERS: SessionFilterT = { playerId: -1, locked: "all" }

const buildFilters = (query: { [key: string]: string | undefined }): SessionFilterT => {
  let locked = query.locked as SessionFilterT['locked']
  if (!locked || !['all', 'true', 'false'].includes(locked)) {
    locked = DEFAULT_FILTERS.locked
  }
  return {
    playerId: query.playerId ? Number.parseInt(query.playerId) : DEFAULT_FILTERS.playerId,
    locked
  }
}

export default async function SessionsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const query = await searchParams
  const filters = buildFilters(query)
  const conditions = []
  if (filters.playerId !== -1) {
    const playerId = filters.playerId
    const condition: FilterCondition<number, Set<number>> = {
      field: 'player_id',
      type: 'query',
      value: playerId,
      query: sessionByPlayerQueryFn
    }
    conditions.push(condition)
  }
  if (filters.locked !== "all") {
    const locked = filters.locked === "true"
    const condition: FilterCondition<boolean, Set<number>> = {
      field: 'locked',
      type: 'builder',
      value: locked,
      builder: sessionLockedBuilder
    }
    conditions.push(condition)
  }

  const sessions = await getSessions(conditions)
  const players = await getPlayers()
  sessions.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Page>
      <div className="space-y-4">
        <SessionFilter players={players} filters={filters} />
        <SessionList sessions={sessions} />
      </div>
    </Page>
  )
}
