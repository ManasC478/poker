'use client'

import { Hand, MomentType, Player, SessionDetail } from "@/lib/types"
import { ArrowLeft, Lock, X } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { formatLongDate } from "@/lib/format"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import SessionHands from "./session-hands"
import SessionDetailView from "./session-detail"
import { useState } from "react"


export default function Session({
  session,
  players,
  momentTypes,
  hands
}: {
  session: SessionDetail
  players: Player[]
  momentTypes: MomentType[]
  hands: Hand[]
}) {
  const [error, setError] = useState<string | null>(null)
  return (
    <div>
      <Link
        href={`/calendar?date=${session.date}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to calendar
      </Link>

      {error && (
        <div className="flex items-center justify-between mb-4 rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">
          <p>{error}</p>
          <Button size="icon" variant="destructive" onClick={() => setError(null)}>
            <X />
          </Button>
        </div>
      )}


      <header className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Session</p>
        <div className="flex items-center gap-2">
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {formatLongDate(session.date)}
          </h1>
          {
            session.locked && (
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="inline text-destructive" />
                </TooltipTrigger>
                <TooltipContent><p>Session buy-ins and cash-outs are locked.</p></TooltipContent>
              </Tooltip>
            )
          }
        </div>
      </header>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hands">Hands</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SessionDetailView session={session} players={players} momentTypes={momentTypes} setError={setError} />
        </TabsContent>
        <TabsContent value="hands"><SessionHands session={session} players={players} setError={setError} hands={hands} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
