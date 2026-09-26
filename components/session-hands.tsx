'use client'

import { Dispatch, SetStateAction, useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import DeckCard, { SUIT_SYMBOLS } from "./card";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Board, Card as CardT, Hand, HandPlayer, Player, SessionDetail } from "@/lib/types";
import { Label } from "./ui/label";
import NumberInput from "./number-input";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { createHand } from "@/lib/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

type CardSize = "xs" | "sm" | "md";

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const EMPTY_CARD: CardT = { suit: '', rank: '' };
const isEmptyCard = (c: CardT) => !c.suit || !c.rank;

export default function SessionHands({ session, players, setError, hands }: { session: SessionDetail, players: Player[], setError: Dispatch<SetStateAction<string | null>>, hands: Hand[] }) {

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <HandForm setError={setError} session={session} players={players} />
      </div>
      <HandHistory hands={hands} players={players} />
    </div>
  )
}
function HandForm({ session, players, setError }: { session: SessionDetail, players: Player[], setError: Dispatch<SetStateAction<string | null>> }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [board, setBoard] = useState<Board>({
    flop1: null,
    flop2: null,
    flop3: null,
    turn: null,
    river: null,
  })
  const [notes, setNotes] = useState<string>('')
  const [handPlayers, setHandPlayers] = useState<HandPlayer[]>([])

  const setBoardCard = (key: keyof Board) => (suit: string, rank: string) =>
    setBoard((prev) => ({ ...prev, [key]: { suit, rank } }))

  async function handleAddHand() {
    setError(null)
    startTransition(async () => {
      const res = await createHand(session.id, board, handPlayers, notes)
      if (res.error) {
        setError(res.error)
        return
      }
      setBoard({
        flop1: null,
        flop2: null,
        flop3: null,
        turn: null,
        river: null,
      })
      setNotes('')
      setHandPlayers([])
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger render={Button}>Add Hand</DialogTrigger>
      <DialogContent>
        <ScrollArea className="h-96">
          <DialogHeader>
            <DialogTitle>Add Hand</DialogTitle>
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Board</h3>
              <div className="flex flex-wrap items-start gap-5 overflow-x-auto pb-1">
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <CardSlot card={board.flop1} onChange={setBoardCard("flop1")} />
                    <CardSlot card={board.flop2} onChange={setBoardCard("flop2")} />
                    <CardSlot card={board.flop3} onChange={setBoardCard("flop3")} />
                  </div>
                  <p className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Flop</p>
                </div>
                <div className="space-y-1.5">
                  <CardSlot card={board.turn} onChange={setBoardCard("turn")} />
                  <p className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Turn</p>
                </div>
                <div className="space-y-1.5">
                  <CardSlot card={board.river} onChange={setBoardCard("river")} />
                  <p className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">River</p>
                </div>
              </div>
            </section>
            <Separator />
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Players</h3>
              {handPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No players added to this hand yet.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {handPlayers.map((p, i) => {
                    const player = players.find((pl) => pl.id === p.player_id)
                    return (
                      <li
                        key={`${p.player_id}-${i}`}
                        className="space-y-2 px-3 py-1.5 rounded-lg border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="truncate text-sm font-medium text-foreground">
                              {player?.name ?? "Unknown"}
                              {player?.nickname ? (
                                <span className="font-normal text-muted-foreground"> ({player.nickname})</span>
                              ) : null}
                            </p>
                            {p.is_winner && (
                              <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <Trophy className="size-3" /> Won ${p.amount_won}
                              </p>
                            )}
                          </div>
                          <Button size="icon" variant="outline" onClick={
                            () => setHandPlayers((prev) => prev.filter(pl => pl.player_id !== p.player_id))
                          }><Trash2 className="size-4" /></Button>
                        </div>
                        <div className="flex gap-1">
                          <DeckCard suit={p.card1.suit} rank={p.card1.rank} size="xs" />
                          <DeckCard suit={p.card2.suit} rank={p.card2.rank} size="xs" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <AddPlayer
                players={players.filter(p => !handPlayers.find(pl => pl.player_id === p.id))}
                onAddPlayer={(player) => setHandPlayers((prev) => [...prev, player])}
              />
            </section>
            <Separator />
            <section>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. $1/$2 NLH"
                  className="h-20 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
            </section>
            <div className="flex justify-end">
              <Button onClick={handleAddHand} disabled={pending}>
                Add Hand
              </Button>
            </div>
          </DialogHeader>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A single card slot. The card itself is the picker trigger —
 * click it to choose a rank and suit. Empty slots show a placeholder.
 */
function CardSlot({
  card,
  onChange,
  size = "sm",
}: {
  card: CardT | null
  onChange: (suit: string, rank: string) => void
  size?: CardSize
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            title={card ? `${card.rank} of ${card.suit} — click to change` : "Pick a card"}
            className="relative shrink-0 rounded-lg"
          >
            {card ? (
              <DeckCard suit={card.suit} rank={card.rank} size={size} className="hover:border-gray-400" />
            ) : (
              <>
                <DeckCard variant="placeholder" size={size} className="hover:border-gray-400" />
                <Plus className="pointer-events-none absolute inset-0 m-auto size-5 text-muted-foreground/50" />
              </>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {RANKS.map((rank) => (
            <DropdownMenuSub key={rank}>
              <DropdownMenuSubTrigger>{rank}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={card ? `${card.suit}-${card.rank}` : ""}
                    onValueChange={(val) => {
                      const [suit] = val.split("-");
                      onChange(suit, rank);
                    }}
                  >
                    {SUITS.map((suit) => (
                      <DropdownMenuRadioItem value={`${suit}-${rank}`} key={suit} closeOnClick>
                        <span className={cn("font-semibold", suit === 'hearts' || suit === 'diamonds' ? "text-red-600" : "text-foreground")}>
                          {SUIT_SYMBOLS[suit]}
                        </span>
                        <span className="ml-1 capitalize text-muted-foreground">{suit}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AddPlayer({ players, onAddPlayer }: { players: Player[], onAddPlayer: (player: HandPlayer) => void }) {
  const [handPlayer, setHandPlayer] = useState<HandPlayer>({
    player_id: -1,
    card1: { ...EMPTY_CARD },
    card2: { ...EMPTY_CARD },
    is_winner: false,
    amount_won: 0,
  })

  const items = useMemo(() => {
    return [
      { label: 'Select player…', value: -1 },
      ...players.map(p => ({ label: `${p.name}${p.nickname ? ` (${p.nickname})` : ''}`, value: p.id }))
    ]
  }, [players])

  function handleAddPlayer() {
    onAddPlayer(handPlayer)
    setHandPlayer({
      player_id: -1,
      card1: { ...EMPTY_CARD },
      card2: { ...EMPTY_CARD },
      is_winner: false,
      amount_won: 0,
    })
  }

  const toSlot = (c: CardT): CardT | null => (isEmptyCard(c) ? null : c)

  return (
    <div className="rounded-xl border p-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="min-w-44 flex-1 space-y-1.5">
          <Label>Player</Label>
          <Select
            value={handPlayer.player_id}
            onValueChange={(v) => setHandPlayer((prev) => ({ ...prev, player_id: (v as number) ?? -1 }))}
            items={items}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {items.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Hole cards</Label>
          <div className="flex gap-1.5">
            <CardSlot
              size="xs"
              card={toSlot(handPlayer.card1)}
              onChange={(suit, rank) => setHandPlayer((prev) => ({ ...prev, card1: { suit, rank } }))}
            />
            <CardSlot
              size="xs"
              card={toSlot(handPlayer.card2)}
              onChange={(suit, rank) => setHandPlayer((prev) => ({ ...prev, card2: { suit, rank } }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Result</Label>
          <div className="flex h-10 items-center gap-2">
            <Switch
              checked={handPlayer.is_winner}
              onCheckedChange={(v) => setHandPlayer((prev) => ({ ...prev, is_winner: v }))}
            />
            <span className="text-sm text-muted-foreground">Won</span>
            {handPlayer.is_winner && (
              <NumberInput
                value={String(handPlayer.amount_won)}
                onChange={(v) => setHandPlayer((prev) => ({ ...prev, amount_won: v === '' ? 0 : Number.parseFloat(v) }))}
                placeholder="0"
              />
            )}
          </div>
        </div>

        <Button onClick={handleAddPlayer} disabled={handPlayer.player_id === -1} className="self-end">
          Add player
        </Button>
      </div>
    </div>
  )
}

/**
 * Compact card for dense layouts (hand history). Still a real card,
 * just small enough for a phone screen.
 */
function MiniCard({ suit, rank }: { suit: string; rank: string }) {
  const isRed = suit === "hearts" || suit === "diamonds"
  return (
    <span
      className={cn(
        "inline-flex h-11 w-8 shrink-0 flex-col items-center justify-center rounded-md border bg-white leading-none",
        isRed ? "border-red-200 text-red-600" : "border-gray-300 text-gray-900"
      )}
    >
      <span className="text-[11px] font-bold">{rank}</span>
      <span className="text-sm leading-none">{SUIT_SYMBOLS[suit]}</span>
    </span>
  )
}

function HandHistory({ hands, players }: { hands: Hand[]; players: Player[] }) {
  const ordered = useMemo(() => [...hands].sort((a, b) => b.id - a.id), [hands])

  return (
    <div>
      <h2 className="text-sm font-semibold text-card-foreground">
        Hand History
        {hands.length > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {hands.length}
          </span>
        )}
      </h2>
      <div>
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hands recorded yet. Add the first one above.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ordered.map((hand, i) => (
              <HandRow key={hand.id} hand={hand} number={ordered.length - i} players={players} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function HandRow({ hand, number, players }: { hand: Hand; number: number; players: Player[] }) {
  const flop = hand.hand_cards.filter((c) => c.round === "flop")
  const turn = hand.hand_cards.filter((c) => c.round === "turn")
  const river = hand.hand_cards.filter((c) => c.round === "river")
  const hasBoard = flop.length > 0 || turn.length > 0 || river.length > 0
  const time = new Date(hand.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

  const street = (label: string, cards: { rank: string; suit: string }[]) =>
    cards.length > 0 && (
      <div className="space-y-1">
        <div className="flex gap-1">
          {cards.map((c, j) => (
            <MiniCard key={`${c.rank}-${c.suit}-${j}`} suit={c.suit} rank={c.rank} />
          ))}
        </div>
        <p className="text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
    )

  return (
    <li className="space-y-2.5 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Hand #{number}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>

      {hasBoard && (
        <div className="flex flex-wrap items-start gap-3">
          {street("Flop", flop)}
          {street("Turn", turn)}
          {street("River", river)}
        </div>
      )}

      {hand.players.length > 0 && (
        <ul className="divide-y divide-border">
          {hand.players.map((p) => {
            const player = players.find((pl) => pl.id === p.player_id)
            return (
              <li key={p.player_id} className="flex items-center gap-2 py-1.5">
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                  <span className="font-medium">{player?.name ?? "Unknown"}</span>
                  {player?.nickname ? (
                    <span className="font-normal text-muted-foreground"> ({player.nickname})</span>
                  ) : null}
                  {p.is_winner && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Trophy className="size-3" /> ${p.amount_won}
                    </span>
                  )}
                </p>
                <div className="flex shrink-0 gap-1">
                  <MiniCard suit={p.card1.suit} rank={p.card1.rank} />
                  <MiniCard suit={p.card2.suit} rank={p.card2.rank} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Separator />

      {hand.notes ? (
        <p className="text-sm italic text-muted-foreground">{hand.notes}</p>
      ) : null}
    </li>
  )
}

