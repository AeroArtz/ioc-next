"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EnrichmentTools } from "./enrichment-tools"

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
}

const STATUS_COLORS = {
  "Not Enriched": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  Enriched: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export function IOCDashboard({
  iocs,
  selectedIOC,
  onSelectIOC,
  onRemoveIOC,
  onEnrich,
  loading,
  selectedForEnrichment = [],
  onEnrichmentSelectionChange,
}) {
  const [selectedTools, setSelectedTools] = useState(["virustotal", "abuseipdb", "shodan", "alienvault", "ipinfo"])

  const handleEnrichClick = () => {
    if (selectedForEnrichment.length === 0) {
      alert("Please select at least one IOC to enrich")
      return
    }
    if (selectedTools.length === 0) {
      alert("Please select at least one enrichment tool")
      return
    }
    onEnrich(selectedForEnrichment, selectedTools)
  }

  const handleCheckboxChange = (iocValue, isChecked) => {
    let newSelection
    if (isChecked) {
      newSelection = [...selectedForEnrichment, iocValue]
    } else {
      newSelection = selectedForEnrichment.filter((val) => val !== iocValue)
    }
    onEnrichmentSelectionChange(newSelection)
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      onEnrichmentSelectionChange(iocs.map((ioc) => ioc.value))
    } else {
      onEnrichmentSelectionChange([])
    }
  }

  const isEnriched = (ioc) => {
    return ioc.results && Object.keys(ioc.results).length > 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">IOC Analysis Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          {iocs.length} IOC{iocs.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {iocs.length > 0 && (
        <EnrichmentTools
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
          onEnrich={handleEnrichClick}
          loading={loading}
          selectedCount={selectedForEnrichment.length}
        />
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        {iocs.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No IOCs to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold w-12">
                    <input
                      type="checkbox"
                      checked={selectedForEnrichment.length === iocs.length && iocs.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                      title="Select all IOCs for enrichment"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold w-1/3">IOC Value</th>
                  <th className="px-4 py-3 text-left font-semibold w-24">Type</th>
                  {iocs.some((ioc) => isEnriched(ioc)) && (
                    <>
                      <th className="px-4 py-3 text-left font-semibold w-20">Risk</th>
                      <th className="px-4 py-3 text-center font-semibold w-20">Score</th>
                      <th className="px-4 py-3 text-left font-semibold flex-1">APT Groups</th>
                      <th className="px-4 py-3 text-left font-semibold flex-1">Malware</th>
                      <th className="px-4 py-3 text-center font-semibold w-20">Reports</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {iocs.map((ioc) => {
                  const enriched = isEnriched(ioc)
                  const vtMalicious = ioc.results?.virustotal?.malicious || 0
                  const avCount = ioc.results?.alienvault?.data?.count || 0
                  const aptGroup = ioc.threat_intel?.apt_groups?.[0]
                  const malwareFamilies = ioc.threat_intel?.malware_families || []
                  const riskLevel = ioc.scoring?.risk_level || "UNKNOWN"
                  const score = ioc.scoring?.current_score || 0
                  const isSelected = selectedForEnrichment.includes(ioc.value)

                  return (
                    <tr
                      key={ioc.value}
                      onClick={() => onSelectIOC(ioc)}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleCheckboxChange(ioc.value, e.target.checked)
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-xs break-all max-w-xs text-foreground">
                          {ioc.value.length > 60 ? `${ioc.value.substring(0, 60)}...` : ioc.value}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge className={`${IOC_TYPE_COLORS[ioc.type]} text-xs font-semibold`}>
                          {ioc.type.toUpperCase()}
                        </Badge>
                      </td>

                      {enriched && (
                        <>
                          <td className="px-4 py-3">
                            <Badge className={`${RISK_COLORS[riskLevel]} text-xs font-semibold`}>{riskLevel}</Badge>
                          </td>

                          <td className="px-4 py-3 text-center font-semibold text-foreground">{score.toFixed(1)}</td>

                          <td className="px-4 py-3">
                            {aptGroup ? (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {aptGroup}
                                </Badge>
                                {ioc.threat_intel?.apt_groups?.length > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{ioc.threat_intel.apt_groups.length - 1}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {malwareFamilies.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {malwareFamilies.slice(0, 2).map((family) => (
                                  <Badge key={family} variant="outline" className="text-xs">
                                    {family}
                                  </Badge>
                                ))}
                                {malwareFamilies.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{malwareFamilies.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2 text-xs">
                              <span className="font-semibold text-red-600">{vtMalicious}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="font-semibold text-blue-600">{avCount}</span>
                            </div>
                          </td>
                        </>
                      )}

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
