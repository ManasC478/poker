import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  req: NextRequest,
  { params }: {
    params: Promise<{ id: string }>
  }) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const body = await req.json()

    const supabase = await createClient()
    const { error } = await supabase.from("sessions").update(body).eq("id", idNum)
    if (error) throw new Error(error.message)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
}
