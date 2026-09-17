'use client'

import { useMemo, useState } from "react";
import DeckCard, { SUIT_SYMBOLS } from "./card";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card as CardT, HandPlayer } from "@/lib/types";
import { Player } from "@/lib/types";
import { Label } from "./ui/label";
import NumberInput from "./number-input";
import { Switch } from "./ui/switch";

type Board = {
  flop1: CardT | null
  flop2: CardT | null
  flop3: CardT | null
  turn: CardT | null
  river: CardT | null
}

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];

export default function SessionHands({ players }: { players: Player[] }) {
  const [board, setBoard] = useState<Board>({
    flop1: null,
    flop2: null,
    flop3: null,
    turn: null,
    river: null,
  })
  const [handPlayers, setHandPlayers] = useState<HandPlayer[]>([])

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Add Hand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-card-foreground">Board</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
              <div className="flex flex-col items-center space-y-2">
                <DeckCard suit={board.flop1?.suit || ''} rank={board.flop1?.rank || ''} />
                <CardSelect value={board.flop1 ? `${board.flop1.suit}-${board.flop1.rank}` : ''} onValueChange={(suit, rank) => {
                  setBoard((prev) => ({ ...prev, flop1: { suit, rank } }))
                }} />
                <label>Flop</label>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <DeckCard suit={board.flop2?.suit || ''} rank={board.flop2?.rank || ''} />
                <CardSelect value={board.flop2 ? `${board.flop2.suit}-${board.flop2.rank}` : ''} onValueChange={(suit, rank) => {
                  setBoard((prev) => ({ ...prev, flop2: { suit, rank } }))
                }} />
                <label>Flop</label>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <DeckCard suit={board.flop3?.suit || ''} rank={board.flop3?.rank || ''} />
                <CardSelect value={board.flop3 ? `${board.flop3.suit}-${board.flop3.rank}` : ''} onValueChange={(suit, rank) => {
                  setBoard((prev) => ({ ...prev, flop3: { suit, rank } }))
                }} />
                <label>Flop</label>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <DeckCard suit={board.turn?.suit || ''} rank={board.turn?.rank || ''} />
                <CardSelect value={board.turn ? `${board.turn.suit}-${board.turn.rank}` : ''} onValueChange={(suit, rank) => {
                  setBoard((prev) => ({ ...prev, turn: { suit, rank } }))
                }} />
                <label>Turn</label>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <DeckCard suit={board.river?.suit || ''} rank={board.river?.rank || ''} />
                <CardSelect value={board.river ? `${board.river.suit}-${board.river.rank}` : ''} onValueChange={(suit, rank) => {
                  setBoard((prev) => ({ ...prev, river: { suit, rank } }))
                }} />
                <label>River</label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-card-foreground">Players</h2>
            <div>
              {handPlayers.map((p, i) => {
                const plauerName = players.find(pl => pl.id === p.player_id)?.name ?? "Unknown"
                return (
                  <div key={i}>
                    <p>{plauerName} <span>{p.is_winner ? "(won $" + p.amount_won + ")" : ""}</span></p>
                    <div className="flex flex-col items-center space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                      <DeckCard suit={p.card1.suit} rank={p.card1.rank} />
                      <DeckCard suit={p.card2.suit} rank={p.card2.rank} />
                    </div>
                  </div>
                )
              })}
            </div>
            <AddPlayer players={players} onAddPlayer={player => setHandPlayers(prev => [...prev, player])} />
          </div>

        </CardContent>
      </Card>
    </div >
  )
}

function CardSelect({ value, onValueChange }: { value: string, onValueChange: (suit: string, rank: string) => void }) {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline">Select</Button>} />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {
              RANKS.map((rank) => (
                <DropdownMenuSub key={rank}>
                  <DropdownMenuSubTrigger>{rank}</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={value}
                        onValueChange={(val) => {
                          const [suit] = val.split('-');
                          onValueChange(suit, rank);
                        }}
                      >
                        {
                          SUITS.map((suit) => (
                            <DropdownMenuRadioItem value={`${suit}-${rank}`} key={suit}>{SUIT_SYMBOLS[suit]}</DropdownMenuRadioItem>
                          ))
                        }
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function AddPlayer({ players, onAddPlayer }: { players: Player[], onAddPlayer: (player: HandPlayer) => void }) {
  const [handPlayer, setHandPlayer] = useState<HandPlayer>({
    player_id: -1,
    card1: { suit: '', rank: '' },
    card2: { suit: '', rank: '' },
    is_winner: false,
    amount_won: 0
  })

  const items = useMemo(() => {
    return [
      { label: 'Select player…', value: -1 },
      ...players.map(p => ({ label: `${p.name} ${p.nickname ? `(${p.nickname})` : ''}`, value: p.id }))
    ]
  }, [players])

  function handleAddPlayer() {
    setHandPlayer(prev => ({ ...prev, player_id: -1, card1: { suit: '', rank: '' }, card2: { suit: '', rank: '' }, is_winner: false, amount_won: 0 }))
    onAddPlayer(handPlayer)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-card-foreground">Add Players</h3>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label htmlFor="players">Players</Label>
            <Select value={handPlayer.player_id} onValueChange={(v) => setHandPlayer(prev => ({ ...prev, player_id: v || -1 }))} items={items}>
              <SelectTrigger>
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
            <Label htmlFor="winner">Is Winner</Label>
            <Switch checked={handPlayer.is_winner} onCheckedChange={(v) => setHandPlayer(prev => ({ ...prev, is_winner: v }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Won</Label>
            <NumberInput value={String(handPlayer.amount_won)} onChange={(v) => {
              const vf = Number.parseFloat(v);
              setHandPlayer(prev => ({ ...prev, amount_won: v === '' ? 0 : Number.parseFloat(v) }))
            }} placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="players">Cards</Label>
          <div className="flex flex-col items-center space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <div className="flex flex-col items-center space-y-2">
              <DeckCard suit={handPlayer.card1.suit} rank={handPlayer.card1.rank} />
              <CardSelect value={`${handPlayer.card1.suit}-${handPlayer.card1.rank}`} onValueChange={(suit, rank) => setHandPlayer(prev => ({ ...prev, card1: { suit, rank } }))} />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <DeckCard suit={handPlayer.card2.suit} rank={handPlayer.card2.rank} />
              <CardSelect value={`${handPlayer.card2.suit}-${handPlayer.card2.rank}`} onValueChange={(suit, rank) => {
                setHandPlayer(prev => ({ ...prev, card2: { suit, rank } }))
              }} />
            </div>
          </div>
        </div>
        <Button onClick={handleAddPlayer}>Add</Button>
      </div>
    </div>
  )
}
