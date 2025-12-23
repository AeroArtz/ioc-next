"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bug, Shield, Download } from "lucide-react"

const RISK_COLORS = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  INFORMATIONAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

const IOC_TYPE_COLORS = {
  ipv4: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  url: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  domain: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  md5: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  sha256: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  sha1: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  email: "bg-red-100 text-red-800 dark:bg-amber-900 dark:text-amber-200",
}

export function AdhocIOCDashboard({ iocs, onSelectIOC, onRemoveIOC }) {
  const handleDownloadCSV = () => {
    const headers = ["IOC Value", "Type", "Risk Level", "Score", "APT Groups", "Malware"]

    const rows = iocs.map((ioc) => {
      const enriched = isEnriched(ioc)
      const aptGroups =
        enriched && ioc.threat_intel?.apt_groups?.length > 0 ? ioc.threat_intel.apt_groups.join(", ") : ""
      const malwareFamilies =
        enriched && ioc.threat_intel?.malware_families?.length > 0 ? ioc.threat_intel.malware_families.join(", ") : ""

      return [
        `"${ioc.value}"`,
        ioc.type?.toUpperCase() || "UNKNOWN",
        enriched ? ioc.scoring?.risk_level || "" : "",
        enriched ? ioc.scoring?.current_score?.toFixed(1) || "" : "",
        `"${aptGroups}"`,
        `"${malwareFamilies}"`,
      ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `adhoc-ioc-enrichment-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isEnriched = (ioc) => {
    return ioc.results && Object.keys(ioc.results).length > 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Enriched IOCs</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {iocs.length} IOC{iocs.length !== 1 ? "s" : ""}
          </div>
          {iocs.length > 0 && (
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {iocs.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No IOCs to display. Enter IOCs above and click Enrich to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold w-1/3">IOC Value</th>
                  <th className="px-4 py-3 text-left font-semibold w-24">Type</th>
                  <th className="px-4 py-3 text-center font-semibold w-20">Score</th>
                  <th className="px-4 py-3 text-left font-semibold flex-1">Associations</th>
                  <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {iocs.map((ioc, index) => {
                  const enriched = isEnriched(ioc)
                  const aptGroups = ioc.threat_intel?.apt_groups || []
                  const malwareFamilies = ioc.threat_intel?.malware_families || []
                  const riskLevel = ioc.scoring?.risk_level || "UNKNOWN"
                  const score = ioc.scoring?.current_score || 0

                  return (
                    <tr
                      key={`${ioc.value}-${index}`}
                      onClick={() => enriched && onSelectIOC(ioc)}
                      className={`hover:bg-muted/50 transition-colors ${enriched ? "cursor-pointer" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs break-all max-w-xs text-foreground">
                          {ioc.value.length > 60 ? `${ioc.value.substring(0, 60)}...` : ioc.value}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          className={`${IOC_TYPE_COLORS[ioc.type] || "bg-gray-100 text-gray-800"} text-xs font-semibold`}
                        >
                          {ioc.type?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {enriched ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-bold text-foreground">{score.toFixed(1)}</span>
                            <Badge className={`${RISK_COLORS[riskLevel]} text-[10px] px-1.5 py-0`}>{riskLevel}</Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {enriched ? (
                          <div className="space-y-2">
                            {aptGroups.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                  {aptGroups.slice(0, 2).map((group) => (
                                    <Badge
                                      key={group}
                                      className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs"
                                    >
                                      {group}
                                    </Badge>
                                  ))}
                                  {aptGroups.length > 2 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-red-50 text-red-700 dark:bg-red-950"
                                    >
                                      +{aptGroups.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {malwareFamilies.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <Bug className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                  {malwareFamilies.slice(0, 2).map((family) => (
                                    <Badge
                                      key={family}
                                      variant="outline"
                                      className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400"
                                    >
                                      {family}
                                    </Badge>
                                  ))}
                                  {malwareFamilies.length > 2 && (
                                    <Badge variant="outline" className="text-xs text-orange-600">
                                      +{malwareFamilies.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {aptGroups.length === 0 && malwareFamilies.length === 0 && (
                              <span className="text-xs text-muted-foreground italic">No associations</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {enriched && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onSelectIOC(ioc)
                              }}
                              className="h-8 w-8 p-0 text-xs"
                              title="View details"
                            >
                              ▼
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRemoveIOC(ioc.value)
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 text-lg"
                            title="Delete"
                          >
                            ✕
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
