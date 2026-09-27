import { createClient } from "@/lib/supabase/server";
import { getSessions } from "@/lib/data";
import { revalidatePath } from "next/cache";
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

    // NOTE: don't import createSession from "@/lib/actions" here. That module
    // is "use server" and calling it directly from a route handler 500s;
    // use the Supabase server client directly like the GET routes do.
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        date: body.date,
        start_time: body.start_time,
        location: body.location ?? null,
        notes: body.notes ?? null,
      })
      .select("id")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath("/")
    revalidatePath("/calendar")
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    )
  }
}
