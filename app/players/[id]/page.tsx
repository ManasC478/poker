import { notFound } from "next/navigation"
import { getPlayerProfile } from "@/lib/data"
import Page from "@/components/page"
import { PlayerProfileView } from "@/components/player-profile"

export const dynamic = "force-dynamic"

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const playerId = Number.parseInt(id, 10)
  if (Number.isNaN(playerId)) notFound()

  const profile = await getPlayerProfile(playerId)
  if (!profile) notFound()

  return (
    <Page>
      <PlayerProfileView profile={profile} />
    </Page>
  )
}
