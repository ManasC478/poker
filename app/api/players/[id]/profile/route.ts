import { getPlayerProfile } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid player id" }, { status: 400 })

    const profile = await getPlayerProfile(idNum)
    if (!profile) return NextResponse.json({ error: "Player not found" }, { status: 404 })
    return NextResponse.json(profile)
  }
  catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
