import { createClient } from "@/lib/supabase/server"
import type { Player, Session, SessionDetail, LeaderboardEntry, MomentType, MomentRow } from "@/lib/types"

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("players").select("id, name, nickname").order("name")
  if (error) {
    console.log("getPlayers error:", error.message)
    return []
  }
  return data ?? []
}

export async function getMomentTypes(): Promise<MomentType[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("moment_types").select("id, name, emoji, description, created_at").order("name")
  if (error) {
    console.log("getMomentTypes error:", error.message)
    return []
  }
  return data ?? []
}

export async function getSessions(): Promise<Session[]> {
  const supabase = await createClient()

  const [{ data: sessions, error: sErr }, { data: buyIns }, { data: results }, { data: players }] = await Promise.all([
    supabase.from("sessions").select("id, date, location, notes, locked").order("date", { ascending: false }),
    supabase.from("buy_ins").select("session_id, player_id, amount"),
    supabase.from("results").select("session_id, player_id, cash_out"),
    supabase.from("players").select("id, name, nickname"),
  ])

  if (sErr) {
    console.log("getSessions error:", sErr.message)
    return []
  }

  const playerMap = new Map((players ?? []).map((p) => [p.id, p]))

  return (sessions ?? []).map((s) => {
    const buyInMap = new Map<number, number>()
    for (const b of buyIns ?? []) {
      if (b.session_id === s.id) {
        buyInMap.set(b.player_id, (buyInMap.get(b.player_id) ?? 0) + Number(b.amount))
      }
    }
    const cashOutMap = new Map<number, number>()
    for (const r of results ?? []) {
      if (r.session_id === s.id) cashOutMap.set(r.player_id, Number(r.cash_out))
    }

    const playerIds = new Set<number>([...buyInMap.keys(), ...cashOutMap.keys()])
    const participants = [...playerIds].map((pid) => {
      const player = playerMap.get(pid)
      const buy_in = buyInMap.get(pid) ?? 0
      const cash_out = cashOutMap.get(pid) ?? 0
      return {
        player_id: pid,
        name: player?.name ?? "Unknown",
        nickname: player?.nickname ?? null,
        buy_in,
        cash_out,
        net: cash_out - buy_in,
      }
    })

    const total_pot = participants.reduce((sum, p) => sum + p.buy_in, 0)

    return {
      id: s.id,
      date: s.date,
      location: s.location,
      notes: s.notes,
      locked: s.locked,
      participants: participants.sort((a, b) => b.net - a.net),
      total_pot,
    }
  })
}

export async function getSessionDetail(id: number): Promise<SessionDetail | null> {
  const supabase = await createClient()

  const [
    { data: session, error: sErr },
    { data: buyIns },
    { data: resultRows },
    { data: players },
    { data: rawMoments },
  ] = await Promise.all([
    supabase.from("sessions").select("id, date, location, notes, locked").eq("id", id).single(),
    supabase.from("buy_ins").select("id, session_id, player_id, amount, created_at").eq("session_id", id).order("created_at"),
    supabase.from("results").select("session_id, player_id, cash_out").eq("session_id", id),
    supabase.from("players").select("id, name, nickname"),
    supabase
      .from("moments")
      .select("id, session_id, moment_type_id, note, created_at, moment_types(id, name, emoji, description, created_at)")
      .eq("session_id", id)
      .order("created_at"),
  ])

  if (sErr || !session) return null

  const playerMap = new Map((players ?? []).map((p) => [p.id, p]))

  const buy_ins = (buyIns ?? []).map((b) => {
    const player = playerMap.get(b.player_id)
    return {
      id: b.id,
      player_id: b.player_id,
      name: player?.name ?? "Unknown",
      nickname: player?.nickname ?? null,
      amount: Number(b.amount),
      created_at: b.created_at,
    }
  })

  const buyInPlayerIds = new Set(buy_ins.map((b) => b.player_id))
  const results = [...buyInPlayerIds].map((pid) => {
    const player = playerMap.get(pid)
    const result = (resultRows ?? []).find((r) => r.player_id === pid)
    return {
      player_id: pid,
      name: player?.name ?? "Unknown",
      nickname: player?.nickname ?? null,
      cash_out: result ? Number(result.cash_out) : 0,
    }
  })

  const moments: MomentRow[] = (rawMoments ?? []).map((m: any) => ({
    id: m.id,
    session_id: m.session_id,
    moment_type_id: m.moment_type_id,
    moment_type: Array.isArray(m.moment_types) ? m.moment_types[0] : m.moment_types,
    note: m.note,
    created_at: m.created_at,
  }))

  return {
    id: session.id,
    date: session.date,
    location: session.location,
    notes: session.notes,
    locked: session.locked,
    buy_ins,
    results: results.sort((a, b) => a.name.localeCompare(b.name)),
    moments,
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const sessions = await getSessions()
  const byPlayer = new Map<number, LeaderboardEntry>()

  for (const s of sessions) {
    for (const p of s.participants) {
      const cur = byPlayer.get(p.player_id) ?? {
        player_id: p.player_id,
        name: p.name,
        nickname: p.nickname,
        net: 0,
        sessions: 0,
        total_buy_in: 0,
        total_cash_out: 0,
      }
      cur.net += p.net
      cur.sessions += 1
      cur.total_buy_in += p.buy_in
      cur.total_cash_out += p.cash_out
      byPlayer.set(p.player_id, cur)
    }
  }

  return [...byPlayer.values()].sort((a, b) => b.net - a.net)
}
