'use client'

import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
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
import { Card as CardT, HandPlayer, Player } from "@/lib/types";
import { Label } from "./ui/label";
import NumberInput from "./number-input";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

type Board = {
  flop1: CardT | null
  flop2: CardT | null
  flop3: CardT | null
  turn: CardT | null
  river: CardT | null
}

type CardSize = "xs" | "sm" | "md";

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
const EMPTY_CARD: CardT = { suit: '', rank: '' };
const isEmptyCard = (c: CardT) => !c.suit || !c.rank;

export default function SessionHands({ players }: { players: Player[] }) {
  const [board, setBoard] = useState<Board>({
    flop1: null,
    flop2: null,
    flop3: null,
    turn: null,
    river: null,
  })
  const [handPlayers, setHandPlayers] = useState<HandPlayer[]>([])

  const setBoardCard = (key: keyof Board) => (suit: string, rank: string) =>
    setBoard((prev) => ({ ...prev, [key]: { suit, rank } }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Hand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Board</h3>
          <div className="flex items-start gap-5 overflow-x-auto pb-1">
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

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Players</h3>
          {handPlayers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No players added to this hand yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {handPlayers.map((p, i) => {
                const player = players.find((pl) => pl.id === p.player_id)
                return (
                  <li
                    key={`${p.player_id}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-1.5"
                  >
                    <div className="min-w-0 flex-1">
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
                    <div className="flex shrink-0 gap-1">
                      <DeckCard suit={p.card1.suit} rank={p.card1.rank} size="xs" />
                      <DeckCard suit={p.card2.suit} rank={p.card2.rank} size="xs" />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <AddPlayer
            players={players}
            onAddPlayer={(player) => setHandPlayers((prev) => [...prev, player])}
          />
        </section>
      </CardContent>
    </Card>
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
            className="relative shrink-0 rounded-lg outline-none transition duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {card ? (
              <DeckCard suit={card.suit} rank={card.rank} size={size} />
            ) : (
              <>
                <DeckCard variant="placeholder" size={size} />
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
    <div className="rounded-xl border border-dashed border-border p-3">
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
