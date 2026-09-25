import { notFound } from "next/navigation"
import { getHands, getMomentTypes, getPlayers, getSessionDetail } from "@/lib/data"
import Page from "@/components/page"
import Session from "@/components/session"

export const dynamic = "force-dynamic"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = Number.parseInt(id, 10)
  if (Number.isNaN(sessionId)) notFound()

  const [session, players, momentTypes, hands] = await Promise.all([
    getSessionDetail(sessionId),
    getPlayers(),
    getMomentTypes(),
    getHands(sessionId)
  ])
  if (!session) notFound()

  return (
    <Page>
      <Session session={session} players={players} momentTypes={momentTypes} hands={hands} />
    </Page>
  )
}
