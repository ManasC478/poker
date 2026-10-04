import { addTag, removeTag } from "@/lib/handlers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const body = await req.json()
    const res = await addTag(body.tags, idNum)
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: '+e.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const idNum = Number.parseInt(id)
    const body = await req.json()
    const res = await removeTag(body.tags, idNum)
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: '+e.message }, { status: 500 })
  }
}
