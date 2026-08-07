import { PokerCalendar } from "@/components/poker-calendar"
import { getSessions } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const sessions = await getSessions()

  return (
    <main className="min-h-dvh">
      <PokerCalendar sessions={sessions} />
    </main>
  )
}
