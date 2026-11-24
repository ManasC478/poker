import { getPlayer } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid player id" }, { status: 400 })

    const player = await getPlayer(idNum)
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 })
    return NextResponse.json(player)
  }
  catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
