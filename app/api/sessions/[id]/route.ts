import { getSessionDetail } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const session = await getSessionDetail(idNum)

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
    return NextResponse.json(session)
  }
  catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
