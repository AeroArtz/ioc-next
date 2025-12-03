"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { EnrichmentTools } from "./enrichment-tools"

const IOC_TYPE_COLORS = {
  ipv4: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  url: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  domain: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  md5: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  sha256: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function IOCTable({ iocs, onRemoveIOC, onEnrich, loading }) {
  const [selectedTools, setSelectedTools] = useState(["virustotal", "abuseipdb", "shodan", "alienvault", "ipinfo"])

  const handleEnrichClick = () => {
    if (iocs.length === 0) {
      alert("No IOCs to enrich")
      return
    }
    if (selectedTools.length === 0) {
      alert("Please select at least one enrichment tool")
      return
    }
    onEnrich(iocs, selectedTools)
  }

  const enrichedCount = useMemo(() => {
    return iocs.filter((ioc) => ioc.results && Object.keys(ioc.results).length > 0).length
  }, [iocs])

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Indicators of Compromise</h2>
        <div className="text-sm text-muted-foreground">{iocs.length > 0 && <span>{iocs.length} IOCs</span>}</div>
      </div>

      {iocs.length > 0 && (
        <EnrichmentTools
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
          onEnrich={handleEnrichClick}
          loading={loading}
          selectedCount={iocs.length}
        />
      )}

      <div className="flex-1 border border-border rounded-lg overflow-auto">
        {iocs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No IOCs extracted yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Value</th>
                <th className="px-4 py-3 text-left font-semibold w-24">Type</th>
                <th className="px-4 py-3 text-left font-semibold w-20">Status</th>
                <th className="px-4 py-3 text-left font-semibold w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {iocs.map((ioc, index) => (
                <tr key={index} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs break-all max-w-xs">
                    {ioc.value.length > 80 ? `${ioc.value.substring(0, 80)}...` : ioc.value}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={IOC_TYPE_COLORS[ioc.type] || ""}>
                      {ioc.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {ioc.results && Object.keys(ioc.results).length > 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        Enriched
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemoveIOC(index)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                      aria-label="Remove IOC"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {enrichedCount > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {enrichedCount} of {iocs.length} IOCs enriched
        </div>
      )}
    </div>
  )
}
