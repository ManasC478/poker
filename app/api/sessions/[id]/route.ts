import { getSessionDetail } from "@/lib/data";
import { updateSessionMeta } from "@/lib/handlers";
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const body = await req.json()
    const res = await updateSessionMeta(
      {
        id: idNum,
        location: body.location,
        notes: body.notes,
        start_time: body.start_time
      }
    )
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 204 })
  }
  catch (e) {
    return NextResponse.json({ error: 'Internal server error: '+e.message }, { status: 500 })
  }
}
