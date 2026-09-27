# Poker API

**If you are an AI agent: read this file before calling any endpoint.** It is the
contract for the API. You do not need to read the route handler source code —
this document describes every endpoint, its response shape, and its error cases.
If an endpoint you need is missing, say so instead of guessing at a URL.

This document is also served live by the API itself at `GET /api/docs`
(`text/markdown`). If you already know the API base URL, fetch that instead of
the GitHub URL — the live copy always matches the deployed code.

## Base URL

- Production: `https://poker-nine-inky.vercel.app`
- Local dev: `http://localhost:3000`

All endpoints return JSON. There is currently **no authentication** on these
routes — they are public GETs. (Auth will be required once mutation endpoints
land; this document will be updated when that happens.)

## Conventions

- IDs (`id`, `player_id`, `session_id`, `hand_id`) are numbers.
- Dates are `YYYY-MM-DD` strings (e.g. `"2026-09-27"`).
- Timestamps (`created_at`, `start_time`) are ISO strings.
- Money (`buy_in`, `cash_out`, `net`, `amount`, `amount_won`) is a plain number
  in dollars.
- A card is `{ "rank": "A", "suit": "spades" }`. Rank is one of
  `2–10, J, Q, K, A`; suit is one of `spades, hearts, diamonds, clubs`.

## Endpoints

### `GET /api/docs`

This documentation, served live as `text/markdown`. Fetch this first if you
only know the base URL.

### `GET /api/players`

All players, ordered by name.

Response: array of
```json
{ "id": 1, "name": "Manas", "nickname": null }
```
`nickname` may be `null`. Use this to resolve a person's name to their
`player_id` before calling endpoints that need an id.

### `GET /api/moments-types`

All moment types (e.g. bad beat, big bluff), ordered by name.

Response: array of
```json
{ "id": 1, "name": "Bad Beat", "emoji": "💀", "description": "...", "created_at": "..." }
```
`emoji` and `description` may be `null`.

### `GET /api/sessions`

All sessions, newest first. No pagination or filtering yet — the full list is
returned.

Response: array of
```json
{
  "id": 12,
  "date": "2026-09-27",
  "start_time": "2026-09-27T19:00:00",
  "location": "Manas's place",
  "notes": null,
  "locked": false,
  "total_pot": 600,
  "participants": [
    { "player_id": 1, "name": "Manas", "nickname": null, "buy_in": 200, "cash_out": 350, "net": 150 }
  ]
}
```
`start_time`, `location`, `notes` may be `null`. `net = cash_out - buy_in`.

### `GET /api/sessions/{id}`

Full detail for one session, including every buy-in, cash-out result, moment,
and tag.

Response:
```json
{
  "id": 12,
  "date": "2026-09-27",
  "start_time": "2026-09-27T19:00:00",
  "location": "Manas's place",
  "notes": null,
  "locked": false,
  "buy_ins": [
    { "id": 5, "player_id": 1, "name": "Manas", "nickname": null, "amount": 200, "created_at": "..." }
  ],
  "results": [
    { "player_id": 1, "name": "Manas", "nickname": null, "cash_out": 350 }
  ],
  "moments": [
    {
      "id": 3, "session_id": 12, "moment_type_id": 1, "note": "...", "created_at": "...",
      "moment_type": { "id": 1, "name": "Bad Beat", "emoji": "💀", "description": "...", "created_at": "..." }
    }
  ],
  "tags": ["Squad"]
}
```
Errors: `404 { "error": "Session not found" }` for an unknown id;
`500 { "error": "Internal server error" }` on failure.

### `GET /api/sessions/{id}/hands`

Hand history for one session, oldest first. Each hand carries the board
(`hand_cards`, grouped by `round`: `flop` / `turn` / `river`) and each involved
player's hole cards plus winner info.

Response: array of
```json
{
  "id": 44,
  "created_at": "...",
  "session_id": 12,
  "notes": "Vishal shoved the river",
  "hand_cards": [
    { "rank": "A", "suit": "spades", "round": "flop" }
  ],
  "players": [
    {
      "player_id": 1,
      "card1": { "rank": "A", "suit": "hearts" },
      "card2": { "rank": "K", "suit": "hearts" },
      "is_winner": true,
      "amount_won": 120
    }
  ]
}
```
Errors: `500 { "error": "Internal server error" }` on failure. (Unknown session
id returns an empty array, not a 404.)

### `GET /api/leaderboard`

All-time standings, sorted by net descending. **Only sessions tagged `Squad`
count** — this is the crew's official leaderboard, not every session ever played.

Response:
```json
{
  "sessions": 18,
  "biggestPot": 900,
  "entries": [
    {
      "player_id": 1, "name": "Manas", "nickname": null,
      "net": 230, "sessions": 18, "total_buy_in": 1800, "total_cash_out": 2030
    }
  ]
}
```

## Worked examples

```bash
# Who is leading the leaderboard?
curl https://poker-nine-inky.vercel.app/api/leaderboard

# Full detail (buy-ins, results, moments) for session 12
curl https://poker-nine-inky.vercel.app/api/sessions/12

# Every hand played in session 12
curl https://poker-nine-inky.vercel.app/api/sessions/12/hands

# Resolve "Vishal" to a player_id
curl https://poker-nine-inky.vercel.app/api/players
```
