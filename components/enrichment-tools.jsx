"use client"
import { Button } from "@/components/ui/button"
import { Loader2, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const TOOLS = [
  { id: "virustotal", label: "VirusTotal", icon: "🦠" },
  { id: "abuseipdb", label: "AbuseIPDB", icon: "⚠️" },
  { id: "shodan", label: "Shodan", icon: "🔍" },
  { id: "alienvault", label: "AlienVault OTX", icon: "👽" },
  { id: "ipinfo", label: "IPInfo", icon: "🌍" },
]

export function EnrichmentTools({ selectedTools, onToolsChange, onEnrich, loading, selectedCount }) {
  const handleToolToggle = (toolId) => {
    onToolsChange((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-2">Enrichment Tools</p>
          <div className="flex flex-wrap gap-2">
            {selectedTools.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tools selected</p>
            ) : (
              selectedTools.map((toolId) => {
                const tool = TOOLS.find((t) => t.id === toolId)
                return (
                  <div
                    key={toolId}
                    className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.label}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {selectedTools.length === 0 ? "Select Tools" : `${selectedTools.length} Selected`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <p className="px-2 py-1.5 text-sm font-semibold">Enrichment Tools</p>
            <DropdownMenuSeparator />
            {TOOLS.map((tool) => (
              <DropdownMenuCheckboxItem
                key={tool.id}
                checked={selectedTools.includes(tool.id)}
                onCheckedChange={() => handleToolToggle(tool.id)}
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onEnrich} disabled={loading || selectedCount === 0} className="gap-2" size="sm">
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

      {selectedCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedCount} IOC{selectedCount > 1 ? "s" : ""} ready for enrichment • Select tools above to customize
        </div>
      )}
    </div>
  )
}
