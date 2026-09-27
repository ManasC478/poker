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
