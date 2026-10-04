import { getMomentTypes } from "@/lib/data";
import { createMomentType } from "@/lib/handlers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const momenttypes = await getMomentTypes()
  return NextResponse.json(momenttypes)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body?.name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 })
    }

    const res = await createMomentType(
      body.name,
      body.emoji ?? null,
      body.description ?? null,
    )
    if (res.error) return NextResponse.json({ error: res.error }, { status: 500 })
    return NextResponse.json(res, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    )
  }
} 
