import { createHand } from "@/lib/handlers";
import { getHands } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const hands = await getHands(idNum)

    return NextResponse.json(hands)
  }
  catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const body = await req.json()
    const res = await createHand(idNum, body.board, body.players, body.notes)
    if (res.error) throw new Error(res.error)
    return NextResponse.json(res)
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
