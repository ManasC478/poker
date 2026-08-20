import SessionList from "@/components/session-list"
import { getSessions } from "@/lib/data"
import Page from "@/components/page"

export const dynamic = "force-dynamic"

export default async function SessionsPage() {
  const sessions = await getSessions()

  return (
    <Page>
      <SessionList sessions={sessions} />
    </Page>
  )
}
