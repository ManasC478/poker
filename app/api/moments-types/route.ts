import { getMomentTypes } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  const momenttypes = await getMomentTypes()
  return NextResponse.json(momenttypes)
}
