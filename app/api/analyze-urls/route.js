// app/api/analyze-urls/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  const { urls } = await req.json();

  const res = await fetch("http://localhost:8888/analyze-urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JWT_AUTH}`, // safe: server-side
    },
    body: JSON.stringify({ urls }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
