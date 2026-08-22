'use client'

import { Filter } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Player, SessionFilter as SessionFilterT } from "@/lib/types";
import { useMemo, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui/spinner";

const DEFAULT_LOCKED_ITEMS = [
  { label: 'All', value: 'all' },
  { label: 'True', value: 'true' },
  { label: 'False', value: 'false' },
]

export default function SessionFilter({ players, filters }: { players: Player[], filters: SessionFilterT }) {
  const router = useRouter()
  const [playerId, setPlayerId] = useState<SessionFilterT['playerId']>(filters.playerId)
  const [locked, setLocked] = useState<SessionFilterT['locked']>(filters.locked)
  const [pending, startTransition] = useTransition()

  const items = useMemo(() => {
    return [
      { label: 'All players', value: -1 },
      ...players.map(p => ({ label: `${p.name} ${p.nickname ? `(${p.nickname})` : ''}`, value: p.id }))
    ]
  }, [players])

  const handleRedirect = () => {
    startTransition(async () => {
      const params = new URLSearchParams();
      params.set('playerId', playerId.toString());
      params.set('locked', locked.toString());

      router.push(`/sessions?${params.toString()}`);
    })
  };

  return (
    <Card className="rounded-xl bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-4" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <div className="space-y-2">
          <Label htmlFor="players">Players</Label>
          <Select value={playerId} onValueChange={(v) => setPlayerId(v || -1)} items={items}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {
                  items.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locked">Locked</Label>
          <Select defaultValue={"all"} onValueChange={(v) => setLocked(v as SessionFilterT['locked'] || "all")} items={DEFAULT_LOCKED_ITEMS}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DEFAULT_LOCKED_ITEMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end bg-background">
        <Button onClick={handleRedirect} disabled={pending}>
          {pending && <Spinner className="size-3" />} Apply
        </Button>
      </CardFooter>
    </Card>
  )
}
