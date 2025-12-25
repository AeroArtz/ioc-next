"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function ReportViewer({ report, arabic_report, onReportChange }) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadDocx = async () => {
    if (!report) {
      toast({
        title: "No Report",
        description: "Generate a report first",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-report-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`)
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `threat-intel-report-${new Date().toISOString().split("T")[0]}.docx`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Downloaded",
        description: "Report downloaded as .docx file",
      })
    } catch (error) {
      console.error("Error downloading DOCX:", error)
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate DOCX file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadArabicDocx = async () => {
    if (!report) {
      toast({
        title: "No Report",
        description: "Generate a report first",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-report-docx-arabic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report: arabic_report }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`)
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `threat-intel-report-${new Date().toISOString().split("T")[0]}.docx`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Downloaded",
        description: "Arabic Report downloaded as .docx file",
      })
    } catch (error) {
      console.error("Error downloading Arabic DOCX:", error)
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate Arabic DOCX file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }
const formatReportForDisplay = () => {
  if (!report) return ""

  return `
${report.title || ""}

${report.date ? `Date: ${report.date}` : ""}

Executive Summary

${report.executive_summary || ""}


Technical Analysis

${report.technical_analysis || ""}


Recommendations

${report.recommendations || ""}


Conclusion

${report.conclusion || ""}

References

${
  Array.isArray(report.references)
    ? report.references.map((r, i) => `${i + 1}. ${r}`).join("\n")
    : report.references || ""
}
`.trim()
}


  const displayText = formatReportForDisplay()

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Threat Report</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadDocx}
          disabled={!report || isDownloading}
          className="gap-2 bg-transparent"
        >
          {isDownloading ? "⏳ Generating..." : "⬇️ Download (.docx)"}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Arabic Threat Report</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadArabicDocx}
          disabled={!arabic_report || isDownloading}
          className="gap-2 bg-transparent"
        >
          {isDownloading ? "⏳ Generating Arabic Doc..." : "⬇️ Download in Arabic(.docx)"}
        </Button>
      </div>

      <div className="w-full h-[500px] p-4 bg-background text-foreground font-mono text-sm overflow-y-auto rounded border whitespace-pre-wrap border-border">
        {displayText || "Report will appear here after analysis..."}
      </div>
    </div>
  )
}
