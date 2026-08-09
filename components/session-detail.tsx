"use client"

import type React from "react"
import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  WalletCards,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  addBuyIn,
  addMoment,
  createMomentType,
  createPlayer,
  deleteBuyIn,
  deleteSession,
  updateBuyIn,
  updateCashOut,
  updateSessionMeta,
} from "@/lib/actions"
import type { MomentRow, MomentType, Player, SessionDetail } from "@/lib/types"
import { formatLongDate, formatMoney, formatSigned } from "@/lib/format"
import NumberInput from "./number-input"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function SessionDetailView({
  session,
  players,
  momentTypes,
}: {
  session: SessionDetail
  players: Player[]
  momentTypes: MomentType[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [location, setLocation] = useState(session.location ?? "")
  const [startTime, setStartTime] = useState(session.start_time)
  const [notes, setNotes] = useState(session.notes ?? "")
  const [metaDirty, setMetaDirty] = useState(false)

  const [newPlayerId, setNewPlayerId] = useState<number | "">("")
  const [newAmount, setNewAmount] = useState("")

  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newName, setNewName] = useState("")
  const [newNick, setNewNick] = useState("")
  const [addingPlayer, setAddingPlayer] = useState(false)

  const [editingBuyIns, setEditingBuyIns] = useState<Record<number, string>>({})
  const [editingCashOuts, setEditingCashOuts] = useState<Record<number, string>>({})

  // Moments state
  const [showAddMomentType, setShowAddMomentType] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeEmoji, setNewTypeEmoji] = useState("")
  const [newTypeDescription, setNewTypeDescription] = useState("")
  const [addingMomentType, setAddingMomentType] = useState(false)

  const totals = useMemo(() => {
    const totalPot = session.buy_ins.reduce((s, b) => s + b.amount, 0)
    const totalCash = session.results.reduce((s, r) => s + r.cash_out, 0)
    const buyInByPlayer = new Map<number, number>()
    for (const b of session.buy_ins) {
      buyInByPlayer.set(b.player_id, (buyInByPlayer.get(b.player_id) ?? 0) + b.amount)
    }
    const playerResults = session.results.map((r) => ({
      ...r,
      buy_in: buyInByPlayer.get(r.player_id) ?? 0,
      net: r.cash_out - (buyInByPlayer.get(r.player_id) ?? 0),
    }))
    return {
      totalPot,
      totalCash,
      balanced: Math.abs(totalPot - totalCash) < 0.005,
      playerResults: playerResults.sort((a, b) => b.net - a.net),
    }
  }, [session])

  const momentCounters = useMemo(() => {
    const momentsByType = new Map<number, MomentRow[]>()
    for (const m of session.moments) {
      if (!m.moment_type_id) continue
      const list = momentsByType.get(m.moment_type_id) ?? []
      list.push(m)
      momentsByType.set(m.moment_type_id, list)
    }

    const typeMap = new Map<number, MomentType>()
    for (const mt of momentTypes) {
      typeMap.set(mt.id, mt)
    }
    for (const m of session.moments) {
      if (m.moment_type_id && m.moment_type && !typeMap.has(m.moment_type_id)) {
        typeMap.set(m.moment_type_id, m.moment_type)
      }
    }

    return Array.from(typeMap.values())
      .map((mt) => {
        const moments = momentsByType.get(mt.id) ?? []
        return {
          momentType: mt,
          count: moments.length,
          moments,
        }
      })
      .sort((a, b) => {
        if (a.count !== b.count) return b.count - a.count
        return a.momentType.name.localeCompare(b.momentType.name)
      })
  }, [momentTypes, session.moments])

  function saveMeta() {
    setError(null)
    startTransition(async () => {
      const res = await updateSessionMeta({
        id: session.id,
        location: location.trim() || null,
        notes: notes.trim() || null,
        start_time: startTime.trim()
      })
      if (res.error) setError(res.error)
      else {
        setMetaDirty(false)
        router.refresh()
      }
    })
  }

  function handleAddBuyIn() {
    if (!newPlayerId || !newAmount) return
    const amount = Number.parseFloat(newAmount)
    if (amount <= 0) return

    setError(null)
    startTransition(async () => {
      const res = await addBuyIn(session.id, newPlayerId, amount)
      if (res.error) setError(res.error)
      else {
        setNewPlayerId("")
        setNewAmount("")
        router.refresh()
      }
    })
  }

  async function handleAddPlayer() {
    if (!newName.trim()) return
    setAddingPlayer(true)
    const res = await createPlayer(newName, newNick || null)
    setAddingPlayer(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if (res.player) {
      setNewPlayerId(res.player.id)
    }
    setNewName("")
    setNewNick("")
    setShowAddPlayer(false)
    router.refresh()
  }

  function handleUpdateBuyIn(buyInId: number, value: string) {
    const amount = Number.parseFloat(value)
    if (amount <= 0) return

    setError(null)
    startTransition(async () => {
      const res = await updateBuyIn(buyInId, session.id, amount)
      if (res.error) setError(res.error)
      else {
        setEditingBuyIns((prev) => {
          const next = { ...prev }
          delete next[buyInId]
          return next
        })
        router.refresh()
      }
    })
  }

  function handleDeleteBuyIn(buyInId: number) {
    setError(null)
    startTransition(async () => {
      const res = await deleteBuyIn(buyInId, session.id)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  function handleUpdateCashOut(playerId: number, value: string) {
    const cashOut = Number.parseFloat(value) || 0

    setError(null)
    startTransition(async () => {
      const res = await updateCashOut(session.id, playerId, cashOut)
      if (res.error) setError(res.error)
      else {
        setEditingCashOuts((prev) => {
          const next = { ...prev }
          delete next[playerId]
          return next
        })
        router.refresh()
      }
    })
  }

  function handleDeleteSession() {
    if (!confirm("Delete this session? This cannot be undone.")) return
    setError(null)
    startTransition(async () => {
      const res = await deleteSession(session.id)
      if (res.error) setError(res.error)
      else router.push("/calendar")
    })
  }

  async function handleCreateMomentType() {
    if (!newTypeName.trim()) return
    setAddingMomentType(true)
    setError(null)
    const res = await createMomentType(
      newTypeName.trim(),
      newTypeEmoji.trim() || null,
      newTypeDescription.trim() || null
    )
    setAddingMomentType(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setNewTypeName("")
    setNewTypeEmoji("")
    setNewTypeDescription("")
    setShowAddMomentType(false)
    router.refresh()
  }

  function handleIncrementMoment(momentTypeId: number) {
    setError(null)
    startTransition(async () => {
      const res = await addMoment(session.id, momentTypeId, null)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href={`/calendar?date=${session.date}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to calendar
      </Link>

      <header className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Session</p>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {formatLongDate(session.date)}
          </h1>
        </div>
        {session.locked && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive">
                <Lock data-icon="inline-start" />
                Locked
              </Badge>
            </TooltipTrigger>
            <TooltipContent><p>Session buy-ins and cash-outs are locked.</p></TooltipContent>
          </Tooltip>
        )}
      </header>

      <section className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-5">
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="size-4 text-muted-foreground" /> Location
          </span>
          <input
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setMetaDirty(true)
            }}
            placeholder="e.g. Mike's basement"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="size-4 text-muted-foreground" /> Start time
          </span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value)
              setMetaDirty(true)
            }}
            placeholder="e.g. Mike's basement"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setMetaDirty(true)
            }}
            placeholder="e.g. $1/$2 NLH"
            className="h-20 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>
        {metaDirty && (
          <Button size="sm" onClick={saveMeta} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Save details"}
          </Button>
        )}
      </section>

      {totals.playerResults.length > 0 && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 mb-4 text-sm font-semibold text-card-foreground"><User className="size-4" /> Player</h2>
          <ul className="flex flex-col gap-1.5">
            {totals.playerResults.map((p) => (
              <li key={p.player_id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">
                  {p.name}
                  {p.nickname ? <span className="text-muted-foreground"> “{p.nickname}”</span> : null}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatMoney(p.buy_in)} in
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Sparkles className="size-4 text-amber-500" /> Session Moments
            </h2>
            {session.moments.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {session.moments.length} total
              </Badge>
            )}
          </div>
          {!session.locked && (
            <button
              onClick={() => setShowAddMomentType((v) => !v)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Plus className="size-3.5" /> New type
            </button>
          )}
        </div>

        {showAddMomentType && (
          <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-border bg-background/80 p-3.5 shadow-xs">
            <p className="text-xs font-semibold text-foreground">Create New Moment Type</p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex w-16 flex-col gap-1">
                <span className="text-xs text-muted-foreground">Emoji</span>
                <input
                  value={newTypeEmoji}
                  onChange={(e) => setNewTypeEmoji(e.target.value)}
                  placeholder="🤔"
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-center text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 min-w-[180px]">
                <span className="text-xs text-muted-foreground">Name *</span>
                <input
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder='e.g. Dave - Looking to the Lord'
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Description (optional)</span>
              <input
                value={newTypeDescription}
                onChange={(e) => setNewTypeDescription(e.target.value)}
                placeholder="e.g. Always looking up at the ceiling when being raised"
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAddMomentType(false)}
                className="h-8 rounded-md px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreateMomentType}
                disabled={addingMomentType || !newTypeName.trim()}
                size="sm"
                className="h-8"
              >
                {addingMomentType ? <Loader2 className="size-3.5 animate-spin" /> : "Save type"}
              </Button>
            </div>
          </div>
        )}

        {momentCounters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No moment types created yet. Click &ldquo;New type&rdquo; above to create one!
          </p>
        ) : (
          <div className="space-y-2">
            {momentCounters.map(({ momentType, count, moments }) => (
              <div
                key={momentType.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm transition-colors ${count > 0
                  ? "border-border/80 bg-background/80 shadow-xs"
                  : "border-border/40 bg-background/30 opacity-75"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-lg ${count > 0 ? "bg-amber-500/15" : "bg-muted"
                      }`}
                  >
                    {momentType.emoji || "✨"}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">
                      {momentType.name}
                    </h3>
                    {momentType.description && (
                      <p className="truncate text-xs text-muted-foreground">{momentType.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`flex h-8 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums ${count > 0
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {count}
                  </span>
                  {!session.locked && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleIncrementMoment(momentType.id)}
                        disabled={pending}
                        className="flex size-7 items-center justify-center rounded-md border border-border bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                        title="Increment count"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mb-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 mb-4 text-sm font-semibold text-card-foreground"><WalletCards className="size-4 text-amber-200" /> Buy-in</h2>

        {session.buy_ins.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">No buy-ins yet. Add one below.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.buy_ins.map((b, i) => {
                const isRebuy = session.buy_ins.slice(0, i).some((prev) => prev.player_id === b.player_id)
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {b.name}
                        {b.nickname ? <span className="text-muted-foreground"> “{b.nickname}”</span> : null}
                        {isRebuy && (
                          <span className="ml-1.5 text-xs text-muted-foreground">(rebuy)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {
                        session.locked ? (
                          <p>${b.amount}</p>
                        ) : (
                          <NumberInput
                            value={editingBuyIns[b.id] ?? String(b.amount)}
                            onChange={(v) => setEditingBuyIns((prev) => ({ ...prev, [b.id]: v }))}
                            onBlur={() => {
                              const val = editingBuyIns[b.id]
                              if (val !== undefined && val !== String(b.amount)) {
                                handleUpdateBuyIn(b.id, val)
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = editingBuyIns[b.id] ?? String(b.amount)
                                if (val !== String(b.amount)) handleUpdateBuyIn(b.id, val)
                              }
                            }}
                            disabled={pending}
                          />
                        )
                      }
                    </TableCell>
                    {
                      !session.locked && (
                        <TableCell>
                          <button
                            onClick={() => handleDeleteBuyIn(b.id)}
                            disabled={pending}
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                            aria-label="Delete buy-in"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </TableCell>
                      )
                    }
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {!session.locked && (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Player</span>
              <select
                value={newPlayerId}
                onChange={(e) => setNewPlayerId(e.target.value ? Number(e.target.value) : "")}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">Select player…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.nickname ? ` "${p.nickname}"` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Amount</span>
              <NumberInput
                value={newAmount}
                onChange={setNewAmount}
                placeholder="0"
                wide
                disabled={pending || session.locked}
              />
            </label>
            <Button
              onClick={handleAddBuyIn}
              disabled={pending || !newPlayerId || !newAmount}
              className="h-10 gap-1.5"
            >
              <Plus className="size-4" /> Add buy-in
            </Button>
            <button
              onClick={() => setShowAddPlayer((v) => !v)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <UserPlus className="size-4" /> New player
            </button>
          </div>

        )}

        {showAddPlayer && (
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-background/50 p-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-muted-foreground">Name</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-muted-foreground">Nickname</span>
              <input
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                placeholder="Optional"
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </label>
            <Button onClick={handleAddPlayer} disabled={addingPlayer || !newName.trim()} className="h-9">
              {addingPlayer ? <Loader2 className="size-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        )}
      </section>

      {totals.playerResults.length > 0 && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 mb-4 text-sm font-semibold text-card-foreground"><DollarSign className="size-4 text-green-500" /> Results</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Buy-in</TableHead>
                <TableHead>Cash-out</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totals.playerResults.map((p) => (
                <TableRow key={p.player_id}>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {p.name}
                      {p.nickname ? <span className="text-muted-foreground"> “{p.nickname}”</span> : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums text-muted-foreground">{formatMoney(p.buy_in)}</span>
                  </TableCell>
                  <TableCell>

                    {
                      session.locked ? (
                        <p>${p.cash_out}</p>
                      ) : (
                        <NumberInput
                          value={editingCashOuts[p.player_id] ?? String(p.cash_out)}
                          onChange={(v) => setEditingCashOuts((prev) => ({ ...prev, [p.player_id]: v }))}
                          onBlur={() => {
                            const val = editingCashOuts[p.player_id]
                            if (val !== undefined && val !== String(p.cash_out)) {
                              handleUpdateCashOut(p.player_id, val)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const val = editingCashOuts[p.player_id] ?? String(p.cash_out)
                              if (val !== String(p.cash_out)) handleUpdateCashOut(p.player_id, val)
                            }
                          }}
                          disabled={pending || session.locked}
                        />
                      )
                    }
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{
                        color: p.net > 0 ? "var(--win)" : p.net < 0 ? "var(--loss)" : "var(--muted-foreground)",
                      }}
                    >
                      {p.net !== 0 ? formatSigned(p.net) : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}


      <div className="mb-8 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Total pot{" "}
          <span className="font-semibold text-foreground tabular-nums">{formatMoney(totals.totalPot)}</span>
        </span>
        <span
          className="font-medium"
          style={{ color: totals.balanced ? "var(--win)" : "var(--gold)" }}
        >
          {totals.balanced
            ? "Balanced"
            : `Off by $${Math.abs(totals.totalPot - totals.totalCash).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <footer className="border-t border-border pt-6">
        <button
          onClick={handleDeleteSession}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive transition-colors hover:opacity-80"
        >
          <Trash2 className="size-4" /> Delete session
        </button>
      </footer>
    </div>
  )
}

