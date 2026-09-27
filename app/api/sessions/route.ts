import { getSessions } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  const sessions = await getSessions()
  return NextResponse.json(sessions)
}
