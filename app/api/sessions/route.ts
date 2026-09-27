import { createSession } from "@/lib/actions";
import { getSessions } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sessions = await getSessions()
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    if (!body.date || !body.start_time) return NextResponse.json({ error: 'Missing date or start_time' }, { status: 400 })

    body.location = body.location ?? null
    body.notes = body.notes ?? null

    const res = await createSession(body)
    if (res.error) throw new Error(res.error)
    return NextResponse.json(res)
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
