// app/api/analyze-urls/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json()
    const { report } = body

    if (!report) {
      return Response.json({ success: false, message: "Missing report data" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8888"
    const response = await fetch(`${backendUrl}/generate-report-docx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.JWT_AUTH}`,
      },
      body: JSON.stringify({ report }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Return the blob with proper headers for file download
    return new Response(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=threat-intel-report.docx",
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return Response.json({ success: false, message: error.message || "Failed to generate report" }, { status: 500 })
  }
}
