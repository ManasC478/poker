"use client"

import { MapPin, Lock } from "lucide-react"
import type { Session } from "@/lib/types"
import { formatMoney, formatSigned } from "@/lib/format"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ButtonLink from "@/components/button-link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

export default function SessionCard({ session }: { session: Session }) {
  return (
    <Card className="rounded-xl bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{session.location || "Unknown location"}</span>
        </CardTitle>
        <CardDescription>
          {session.locked && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="inline-flex items-center">
                  <Lock className="mr-1 size-3" />
                  Locked
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Session buy-ins and cash-outs are locked.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="text-xs">
          <TableHeader className="text-muted-foreground">
            <TableRow>
              <TableHead>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatMoney(session.total_pot)}
                </span>{" "}
                Pot
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                {session.participants.length} player{session.participants.length === 1 ? "" : "s"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {session.participants.length > 0 &&
              session.participants.map((p) => (
                <TableRow key={p.player_id}>
                  <TableCell className="truncate text-foreground">
                    {p.name}
                    {p.nickname ? <span className="text-muted-foreground"> “{p.nickname}”</span> : null}
                  </TableCell>
                  <TableCell
                    className="text-right font-semibold tabular-nums"
                    style={{ color: p.net > 0 ? "var(--win)" : p.net < 0 ? "var(--loss)" : "var(--muted-foreground)" }}
                  >
                    {formatSigned(p.net)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <ButtonLink className="w-full text-center" href={`/sessions/${session.id}`}>
          View
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
