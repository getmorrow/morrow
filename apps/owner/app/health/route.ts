import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "owner",
    service: "morrow-owner",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
