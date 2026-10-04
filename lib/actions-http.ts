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

export async function putSessionTag(id: number, tags: string[]) {
  const res = await fetch(`/api/sessions/${id}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tags })
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
}

export async function deleteSessionTag(id: number, tags: string[]) {
  const res = await fetch(`/api/sessions/${id}/tags`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tags })
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
}

export async function patchSessionLock(id: number, lock: boolean) {
  const res = await fetch(`/api/sessions/${id}/lock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locked: lock })
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
}

export async function deleteSession(id: number) {
  const res = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
}

export async function postPlayer(name: string, nickname: string | null) {
  const res = await fetch(`/api/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, nickname })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error)
  }
  return data
}

export async function postMomentType(name: string, emoji: string | null, description: string | null) {
  const res = await fetch(`/api/moments-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, emoji, description })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error)
  }
  return data
}
