import { notFound } from "next/navigation"
import { SessionDetailView } from "@/components/session-detail"
import { getMomentTypes, getPlayers, getSessionDetail } from "@/lib/data"
import Page from "@/components/page"

export const dynamic = "force-dynamic"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = Number.parseInt(id, 10)
  if (Number.isNaN(sessionId)) notFound()

  const [session, players, momentTypes] = await Promise.all([
    getSessionDetail(sessionId),
    getPlayers(),
    getMomentTypes(),
  ])
  if (!session) notFound()

  return (
    <Page>
      <SessionDetailView session={session} players={players} momentTypes={momentTypes} />
    </Page>
  )
}
