// app/api/analyze-urls/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  const { iocs, options } = await req.json();

  const res = await fetch("http://localhost:8888/enrich-iocs", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${process.env.JWT_AUTH}`

          },
          body: JSON.stringify({ iocs: iocs, options: options }),
        });


  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}