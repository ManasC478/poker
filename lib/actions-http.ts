import { Board, HandPlayer } from "./types"

export async function postHand(sessionId: number, board: Board, players: HandPlayer[], notes: string) {
  const res = await fetch(`/api/sessions/${sessionId}/hands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ board, players, notes })
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export async function postSession(date: string, start_time: string, location: string | null, notes: string | null) {
  const res = await fetch(`/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date, start_time, location, notes })
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export async function putSessionMeta(id: number, location: string | null, notes: string | null, start_time: string) {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ location, notes, start_time })
  })
  
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
}
