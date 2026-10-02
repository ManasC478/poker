import { Board, HandPlayer } from "./types"

export async function postHand(sessionId: number, board: Board, players: HandPlayer[], notes: string) {
  console.log(sessionId)
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
