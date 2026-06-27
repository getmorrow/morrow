import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "web",
    service: "morrow-web",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
