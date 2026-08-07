import { notFound } from "next/navigation"
import { SessionDetailView } from "@/components/session-detail"
import { getPlayers, getSessionDetail } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = Number.parseInt(id, 10)
  if (Number.isNaN(sessionId)) notFound()

  const [session, players] = await Promise.all([getSessionDetail(sessionId), getPlayers()])
  if (!session) notFound()

  return (
    <main className="min-h-dvh">
      <SessionDetailView session={session} players={players} />
    </main>
  )
}
