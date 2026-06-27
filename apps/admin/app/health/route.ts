import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    app: "admin",
    service: "morrow-admin",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
