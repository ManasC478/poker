import { createSession } from "@/lib/actions";
import { getSessions } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sessions = await getSessions()
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body?.date || !body?.start_time) {
      return NextResponse.json({ error: "Missing date or start_time" }, { status: 400 })
    }

    const res = await createSession({
      date: body.date,
      start_time: body.start_time,
      location: body.location ?? null,
      notes: body.notes ?? null,
    })
    if (res.error) return NextResponse.json({ error: res.error }, { status: 500 })
    return NextResponse.json(res, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    )
  }
}
