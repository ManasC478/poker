"use server"

import { createClient } from "@/lib/supabase/server"
import type { ParticipantInput } from "@/lib/types"
import { revalidatePath } from "next/cache"

function revalidateSession(sessionId: number) {
  revalidatePath("/")
  revalidatePath("/calendar")
  revalidatePath(`/sessions/${sessionId}`)
}

export async function createSession(input: {
  date: string
  location: string | null
  notes: string | null
  start_time: string
}) {
  const supabase = await createClient()
  if (!input.date) return { error: "Date is required" }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ date: input.date, location: input.location, notes: input.notes, start_time: input.start_time })
    .select("id")
    .single()

  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { id: data.id }
}

export async function updateSessionMeta(input: {
  id: number
  location: string | null
  notes: string | null
  start_time: string
}) {
  const supabase = await createClient()
  const payload: Record<string, any> = {
    location: input.location,
    notes: input.notes,
    start_time: input.start_time
  }

  const { error } = await supabase
    .from("sessions")
    .update(payload)
    .eq("id", input.id)

  if (error) return { error: error.message }
  revalidateSession(input.id)
  return { ok: true }
}

export async function addBuyIn(sessionId: number, playerId: number, amount: number) {
  const supabase = await createClient()
  if (amount <= 0) return { error: "Amount must be greater than 0" }

  const { error } = await supabase
    .from("buy_ins")
    .insert({ session_id: sessionId, player_id: playerId, amount })

  if (error) return { error: error.message }

  const { data: existing } = await supabase
    .from("results")
    .select("player_id")
    .eq("session_id", sessionId)
    .eq("player_id", playerId)
    .maybeSingle()

  if (!existing) {
    await supabase.from("results").insert({ session_id: sessionId, player_id: playerId, cash_out: 0 })
  }

  revalidateSession(sessionId)
  return { ok: true }
}

export async function updateBuyIn(buyInId: number, sessionId: number, amount: number) {
  const supabase = await createClient()
  if (amount <= 0) return { error: "Amount must be greater than 0" }

  const { error } = await supabase.from("buy_ins").update({ amount }).eq("id", buyInId)
  if (error) return { error: error.message }

  revalidateSession(sessionId)
  return { ok: true }
}

export async function deleteBuyIn(buyInId: number, sessionId: number) {
  const supabase = await createClient()

  const { data: buyIn } = await supabase
    .from("buy_ins")
    .select("player_id")
    .eq("id", buyInId)
    .single()

  if (!buyIn) return { error: "Buy-in not found" }

  const { error } = await supabase.from("buy_ins").delete().eq("id", buyInId)
  if (error) return { error: error.message }

  const { count } = await supabase
    .from("buy_ins")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("player_id", buyIn.player_id)

  if (count === 0) {
    await supabase
      .from("results")
      .delete()
      .eq("session_id", sessionId)
      .eq("player_id", buyIn.player_id)
  }

  revalidateSession(sessionId)
  return { ok: true }
}

export async function updateCashOut(sessionId: number, playerId: number, cashOut: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("results")
    .upsert({ session_id: sessionId, player_id: playerId, cash_out: cashOut })

  if (error) return { error: error.message }
  revalidateSession(sessionId)
  return { ok: true }
}

export async function createPlayer(name: string, nickname: string | null) {
  const supabase = await createClient()
  const trimmed = name.trim()
  if (!trimmed) return { error: "Name is required" }

  const { data, error } = await supabase
    .from("players")
    .insert({ name: trimmed, nickname: nickname?.trim() || null })
    .select("id, name, nickname")
    .single()

  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { player: data }
}

export async function saveSession(input: {
  id?: number
  date: string
  location: string | null
  notes: string | null
  participants: ParticipantInput[]
}) {
  const supabase = await createClient()

  if (!input.date) return { error: "Date is required" }

  let sessionId = input.id

  if (sessionId) {
    const { error } = await supabase
      .from("sessions")
      .update({ date: input.date, location: input.location, notes: input.notes })
      .eq("id", sessionId)
    if (error) return { error: error.message }

    // Clear existing rows before re-inserting.
    await supabase.from("buy_ins").delete().eq("session_id", sessionId)
    await supabase.from("results").delete().eq("session_id", sessionId)
  } else {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ date: input.date, location: input.location, notes: input.notes })
      .select("id")
      .single()
    if (error) return { error: error.message }
    sessionId = data.id
  }

  const valid = input.participants.filter((p) => p.player_id)

  if (valid.length > 0) {
    const { error: bErr } = await supabase
      .from("buy_ins")
      .insert(valid.map((p) => ({ session_id: sessionId, player_id: p.player_id, amount: p.buy_in })))
    if (bErr) return { error: bErr.message }

    const { error: rErr } = await supabase
      .from("results")
      .insert(valid.map((p) => ({ session_id: sessionId, player_id: p.player_id, cash_out: p.cash_out })))
    if (rErr) return { error: rErr.message }
  }

  revalidatePath("/")
  revalidatePath("/calendar")
  return { id: sessionId }
}

export async function deleteSession(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("sessions").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { ok: true }
}

export async function lockSession(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("sessions").update({ locked: true }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { ok: true }
}

export async function unlockSession(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("sessions").update({ locked: false }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { ok: true }
}

export async function createMomentType(
  name: string,
  emoji: string | null,
  description: string | null
) {
  const supabase = await createClient()
  const trimmed = name.trim()
  if (!trimmed) return { error: "Name is required" }

  const { data, error } = await supabase
    .from("moment_types")
    .insert({
      name: trimmed,
      emoji: emoji?.trim() || null,
      description: description?.trim() || null,
    })
    .select("id, name, emoji, description, created_at")
    .single()

  if (error) return { error: error.message }
  return { momentType: data }
}

export async function addMoment(sessionId: number, momentTypeId: number, note: string | null) {
  const supabase = await createClient()
  if (!momentTypeId) return { error: "Moment type is required" }

  const { error } = await supabase
    .from("moments")
    .insert({
      session_id: sessionId,
      moment_type_id: momentTypeId,
      note: note?.trim() || null,
    })

  if (error) return { error: error.message }
  revalidateSession(sessionId)
  return { ok: true }
}

export async function deleteMoment(momentId: number, sessionId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from("moments").delete().eq("id", momentId)
  if (error) return { error: error.message }
  revalidateSession(sessionId)
  return { ok: true }
}

export async function addTag(tags: string[], sessionId: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("session_tags")
    .insert(tags.map(t => ({ tag: t, session_id: sessionId })))

  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { ok: true }
}

export async function removeTag(tags: string[], sessionId: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("session_tags")
    .delete()
    .in("tag", tags)
    .eq("session_id", sessionId)

  if (error) return { error: error.message }
  revalidatePath("/")
  revalidatePath("/calendar")
  return { ok: true }
}
