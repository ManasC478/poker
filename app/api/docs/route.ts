import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves the API reference (docs/api.md) as live documentation, so any agent
// that knows the API base URL can discover the contract without a repo clone:
//   GET /api/docs  ->  text/markdown
export async function GET() {
  try {
    const md = await readFile(path.join(process.cwd(), "docs", "api.md"), "utf8");
    return new NextResponse(md, {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "API docs unavailable" }, { status: 500 });
  }
}
