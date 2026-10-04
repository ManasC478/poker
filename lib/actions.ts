"use server"

import { createClient } from "@/lib/supabase/server"
import type { Board, HandPlayer, ParticipantInput } from "@/lib/types"
import { revalidatePath } from "next/cache"

function revalidateSession(sessionId: number) {
  revalidatePath("/")
  revalidatePath("/calendar")
  revalidatePath(`/sessions/${sessionId}`)
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
