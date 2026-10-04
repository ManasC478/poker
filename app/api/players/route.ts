import { getPlayers } from "@/lib/data";
import { createPlayer } from "@/lib/handlers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const players = await getPlayers()
  return NextResponse.json(players)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const res = await createPlayer(body.name, body?.nickname || null)
    if (res.error) throw new Error(res.error)
    return NextResponse.json(res, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
}
