import { PokerCalendar } from "@/components/poker-calendar"
import { getSessions } from "@/lib/data"
import { toDateKey } from "@/lib/format"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CalendarPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const query = await searchParams
  if (query.date === undefined) {
    const today = new Date()
    redirect(`/calendar?date=${toDateKey(today)}`)
  }
  const sessions = await getSessions()

  return (
    <main className="min-h-dvh">
      <PokerCalendar sessions={sessions} date={query.date} />
    </main>
  )
}
