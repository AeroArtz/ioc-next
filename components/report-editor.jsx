"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function ReportEditor({ report, onReportChange }) {
  const { toast } = useToast()
  const [editableReport, setEditableReport] = useState(report)

  if (report !== editableReport && report) {
    setEditableReport(report)
  }

  const handleChange = (e) => {
    const newReport = e.target.value
    setEditableReport(newReport)
    onReportChange?.(newReport)
  }

  const handleDownload = () => {
    if (!editableReport) {
      toast({
        title: "No Report",
        description: "Generate a report first by analyzing URLs",
        variant: "destructive",
      })
      return
    }

    const element = document.createElement("a")
    const file = new Blob([editableReport], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `threat-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Downloaded",
      description: "Report has been downloaded as a text file",
      variant: "default",
    })
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Threat Report</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!editableReport}
          className="gap-2 bg-transparent"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="flex-1 border border-border rounded-lg overflow-hidden flex flex-col">
        {editableReport ? (
          <textarea
            value={editableReport}
            onChange={handleChange}
            className="flex-1 p-4 bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary border-0"
            placeholder="Report will appear here after analysis..."
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Analyze URLs to generate a threat report</p>
          </div>
        )}
      </div>
    </div>
  )
}
