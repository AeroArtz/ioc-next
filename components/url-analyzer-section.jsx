"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function URLAnalyzerSection({ onAnalyze, loading }) {
  const [urls, setUrls] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (urls.trim()) {
      onAnalyze(urls)
      setUrls("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-primary">🔍</div>
            <h1 className="text-3xl font-bold text-foreground">Threat Intelligence Analyzer</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter one or more URLs separated by commas to extract and analyze indicators of compromise
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="https://example.com, https://suspicious.com, ..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !urls.trim()} className="gap-2" size="lg">
              {loading ? <>⏳ Analyzing...</> : "Analyze"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
