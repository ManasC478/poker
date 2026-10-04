import { addBuyIn } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, playerId: string }> }
) {
  try {
    const { id, playerId } = await params
    const idNum = Number.parseInt(id)
    const playerIdNum = Number.parseInt(playerId)
    const body = await req.json()

    if (!body.amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    const res = await addBuyIn(idNum, playerIdNum, body.amount)
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 201 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
}

