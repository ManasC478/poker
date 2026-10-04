import { addMoment, deleteMoment } from "@/lib/handlers"
import { NextRequest, NextResponse } from "next/server"

 export async function POST(
   req: NextRequest,
   { params }: { params: Promise<{ id: string, momentId: string }> }
 ) {
   try {
     const { id, momentId } = await params
     const idNum = Number.parseInt(id)
     const momentIdNum = Number.parseInt(momentId)
     const body = await req.json()
     const res = await addMoment(idNum, momentIdNum, body?.note || null)
     if (res.error) throw new Error(res.error)
     return new Response(null, { status: 201 })
   } catch (e) {
     console.log(e.message)
     return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
   }
 }

 export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string, momentId: string }> }
 ) {
   try {
     const { id, momentId } = await params
     const idNum = Number.parseInt(id)
     const momentIdNum = Number.parseInt(momentId)
     const res = await deleteMoment(idNum, momentIdNum)
     if (res.error) throw new Error(res.error)
     return new Response(null, { status: 204 })
   } catch (e) {
     console.log(e.message)
     return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
   }
 }
