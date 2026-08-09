export type Player = {
  id: number
  name: string
  nickname: string | null
}

export type Participant = {
  player_id: number
  name: string
  nickname: string | null
  buy_in: number
  cash_out: number
  net: number
}

export type Session = {
  id: number
  date: string // YYYY-MM-DD
  location: string | null
  notes: string | null
  locked: boolean
  participants: Participant[]
  total_pot: number
}

export type ParticipantInput = {
  player_id: number
  buy_in: number
  cash_out: number
}

export type BuyInRow = {
  id: number
  player_id: number
  name: string
  nickname: string | null
  amount: number
  created_at: string
}

export type SessionResult = {
  player_id: number
  name: string
  nickname: string | null
  cash_out: number
}

export type MomentType = {
  id: number
  name: string
  emoji: string | null
  description: string | null
  created_at: string
}

export type MomentRow = {
  id: number
  session_id: number
  moment_type_id: number
  moment_type: MomentType
  note: string | null
  created_at: string
}

export type SessionDetail = {
  id: number
  date: string
  location: string | null
  notes: string | null
  locked: boolean
  buy_ins: BuyInRow[]
  results: SessionResult[]
  moments: MomentRow[]
}

export type LeaderboardEntry = {
  player_id: number
  name: string
  nickname: string | null
  net: number
  sessions: number
  total_buy_in: number
  total_cash_out: number
}
