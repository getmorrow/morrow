import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "guest",
    service: "morrow-guest",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
