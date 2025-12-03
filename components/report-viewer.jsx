"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

export function ReportViewer({ report, onReportChange }) {
  const { toast } = useToast()
  const [editableReport, setEditableReport] = useState(report)

  useEffect(() => {
    setEditableReport(report)
  }, [report])

  const handleChange = (e) => {
    const newReport = e.target.value
    setEditableReport(newReport)
    onReportChange?.(newReport)
  }

  const handleDownloadDocx = async () => {
    if (!editableReport) {
      toast({
        title: "No Report",
        description: "Generate a report first",
        variant: "destructive",
      })
      return
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx")
      const FileSaver = await import("file-saver")

      const paragraphs = editableReport.split("\n").map(
        (line) =>
          new Paragraph({
            text: line || "",
            spacing: { line: 240 },
          }),
      )

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      FileSaver.saveAs(blob, `threat-report-${new Date().toISOString().split("T")[0]}.docx`)

      toast({
        title: "Downloaded",
        description: "Report downloaded as .docx file",
      })
    } catch (error) {
      console.error("Error downloading DOCX:", error)
      toast({
        title: "Download Failed",
        description: "Failed to generate DOCX file",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="border border-border rounded-lg bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Threat Report</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadDocx}
          disabled={!editableReport}
          className="gap-2 bg-transparent"
        >
          ⬇️ Download (.docx)
        </Button>
      </div>

      <textarea
        value={editableReport}
        onChange={handleChange}
        className="w-full h-64 p-4 bg-background text-foreground font-mono text-sm resize-none rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Report will appear here after analysis..."
      />
    </div>
  )
}
