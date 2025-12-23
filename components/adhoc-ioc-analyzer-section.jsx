"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Zap,
  Shield,
  AlertTriangle,
  Search,
  AtSign as Alien,
  Globe,
  ScanSearch,
  Biohazard,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const TOOLS = [
  { id: "virustotal", label: "VirusTotal", icon: Biohazard },
  { id: "abuseipdb", label: "AbuseIPDB", icon: AlertTriangle },
  { id: "shodan", label: "Shodan", icon: Search },
  { id: "alienvault", label: "AlienVault OTX", icon: Alien },
  { id: "ipinfo", label: "IPInfo", icon: Globe },
  { id: "urlscan", label: "Urlscan.io", icon: ScanSearch },
  { id: "threatfox", label: "ThreatFox", icon: Shield },
]

export function AdhocIOCAnalyzerSection({ onEnrich, loading, selectedTools, onToolsChange }) {
  const [iocs, setIOCs] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (iocs.trim() && selectedTools.length > 0) {
      onEnrich(iocs)
    }
  }

  const handleToolToggle = (toolId) => {
    onToolsChange((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-primary">🔍</div>
            <h1 className="text-3xl font-bold text-foreground">Ad-hoc IOC Enrichment</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter one or more IOCs separated by comma or newline to enrich them with threat intelligence
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Textarea
              placeholder="Enter IOCs Separated by comma or newline..."
              value={iocs}
              onChange={(e) => setIOCs(e.target.value)}
              disabled={loading}
              className="flex-1 min-h-[120px]"
            />

            <div className="flex items-center gap-3">
              {/* Tools Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={loading}>
                    {selectedTools.length === 0
                      ? "Select Tools"
                      : `${selectedTools.length} Tool${selectedTools.length > 1 ? "s" : ""} Selected`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <p className="px-2 py-1.5 text-sm font-semibold">Enrichment Tools</p>
                  <DropdownMenuSeparator />
                  {TOOLS.map((tool) => {
                    const IconComponent = tool.icon
                    return (
                      <DropdownMenuCheckboxItem
                        key={tool.id}
                        checked={selectedTools.includes(tool.id)}
                        onCheckedChange={() => handleToolToggle(tool.id)}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {tool.label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Selected tools display */}
              <div className="flex-1 flex flex-wrap gap-2">
                {selectedTools.length > 0 ? (
                  selectedTools.map((toolId) => {
                    const tool = TOOLS.find((t) => t.id === toolId)
                    const IconComponent = tool.icon
                    return (
                      <div
                        key={toolId}
                        className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{tool.label}</span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">No tools selected</p>
                )}
              </div>

              {/* Enrich Button */}
              <Button
                type="submit"
                disabled={loading || !iocs.trim() || selectedTools.length === 0}
                className="gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enriching...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Enrich
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
