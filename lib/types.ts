import { PostgrestFilterBuilder } from "@supabase/supabase-js"

export type Player = {
  id: number
  name: string
  nickname: string | null
  /** Bio from the `players.description` column; null when not filled in. */
  description: string | null
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

/** One Squad session's result for a player, with running total after it. */
export type ProfitPoint = {
  session_id: number
  date: string // YYYY-MM-DD
  net: number
  buy_in: number
  cash_out: number
  /** Cumulative net across Squad sessions up to and including this one. */
  cumulative: number
}

/** A run of consecutive winning ("W") or losing ("L") Squad sessions. */
export type Streak = {
  kind: "W" | "L"
  count: number
}

/** The biggest pot a player won in a Squad session, from recorded hands. */
export type BiggestPot = {
  amount: number
  session_id: number
  date: string // YYYY-MM-DD
  card1: Card
  card2: Card
  notes: string
}

/** Everything the player profile page needs for one player. */
export type PlayerProfile = {
  player: Player
  /** Squad-only lifetime totals (same numbers as the leaderboard row). */
  net: number
  sessions: number
  total_buy_in: number
  total_cash_out: number
  /** Squad sessions the player played in, oldest first, with running net. */
  profitHistory: ProfitPoint[]
  /** Share of Squad sessions played that ended in profit, 0–100. 0 when no sessions. */
  win_rate: number
  /** Average net per Squad session played. */
  avg_net: number
  /** Current run of consecutive winning or losing Squad sessions; null when no sessions or the last session broke even. */
  current_streak: Streak | null
  /** Longest run of consecutive winning Squad sessions. */
  longest_win_streak: number
  /** Best single Squad night (largest net), null when no sessions. */
  best_night: ProfitPoint | null
  /** Worst single Squad night (smallest net), null when no sessions. */
  worst_night: ProfitPoint | null
  /** Biggest recorded pot the player won in a Squad session, null when no winning hand is recorded. */
  biggest_pot: BiggestPot | null
  /** Total Squad sessions (played or not) — denominator for attendance. */
  total_squad_sessions: number
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

export type Board = {
  flop1: Card | null
  flop2: Card | null
  flop3: Card | null
  turn: Card | null
  river: Card | null
}

export type HandPlayer = {
  player_id: number
  card1: Card
  card2: Card
  is_winner: boolean
  amount_won: number
}

export type HandCard = {
  rank: string
  suit: string
  round: 'flop' | 'turn' | 'river'
}

export type Hand = {
  id: number
  created_at: string
  session_id: number
  notes: string
  hand_cards: HandCard[]
  players: HandPlayer[]
}
