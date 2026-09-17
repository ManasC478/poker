import { PostgrestFilterBuilder } from "@supabase/supabase-js"

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
  start_time: string | null
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
  start_time: string
  location: string | null
  notes: string | null
  locked: boolean
  buy_ins: BuyInRow[]
  results: SessionResult[]
  moments: MomentRow[]
  tags: string[]
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

export type BuilderFn<T> = (query: PostgrestFilterBuilder<any,any,any,any,any,any,any,any>, value: T) => PostgrestFilterBuilder<any,any,any,any,any,any,any,any>;
export type QueryFn<T, R> = (value: T) => Promise<R>;

export type FilterCondition<T, R=any> = {
  field: string;
  type: 'builder' | 'query';
  value: any;
  builder?: BuilderFn<T>;
  query?: QueryFn<T, R>;
}

export type SessionFilter = {
  playerId: number
  locked: 'all' | 'true' | 'false'
}

export type Card = {
  suit: string
  rank: string
}

export type HandPlayer = {
  player_id: number
  card1: Card
  card2: Card
  is_winner: boolean
  amount_won: number
}
