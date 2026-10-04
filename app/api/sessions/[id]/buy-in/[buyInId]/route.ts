import { deleteBuyIn, updateBuyIn } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, buyInId: string }> }
) {
  try {
    const { id, buyInId } = await params
    const idNum = Number.parseInt(id)
    const buyInIdNum = Number.parseInt(buyInId)
    const body = await req.json()

    if (!body.amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 })
    const res = await updateBuyIn(buyInIdNum, idNum, body.amount)
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, buyInId: string }> }
) {
  try {
    const { id, buyInId } = await params
    const idNum = Number.parseInt(id)
    const buyInIdNum = Number.parseInt(buyInId)
    const res = await deleteBuyIn(buyInIdNum, idNum)
    if (res.error) throw new Error(res.error)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.log(e.message)
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
} 
