import { getPlayers } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  const players = await getPlayers()
  return NextResponse.json(players)
}
