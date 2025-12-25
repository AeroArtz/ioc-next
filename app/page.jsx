"use client"

import { useState, useMemo, useEffect } from "react"
import { URLAnalyzerSection } from "@/components/url-analyzer-section"
import { IOCDashboard } from "@/components/ioc-dashboard"
import { IOCDetailsDrawer } from "@/components/ioc-details-drawer"
import { ReportViewer } from "@/components/report-viewer"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  const [report, setReport] = useState(null)
  const [arabic_report, setArabicReport] = useState(null)
  const [iocs, setIocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIOC, setSelectedIOC] = useState(null)
  const [selectedForEnrichment, setSelectedForEnrichment] = useState([])
  const [filters, setFilters] = useState({
    type: [],
    riskLevel: [],
    aptGroups: [],
    malwareFamilies: [],
    scoreRange: [0, 100],
  })
  const { toast } = useToast()

  const filteredIOCs = useMemo(() => {
    return iocs.filter((ioc) => {
      if (filters.type.length > 0 && !filters.type.includes(ioc.type)) return false
      if (filters.riskLevel.length > 0 && !filters.riskLevel.includes(ioc.scoring?.risk_level)) return false

      const score = ioc.scoring?.current_score || 0
      if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) return false

      if (filters.aptGroups.length > 0) {
        const hasGroup = ioc.threat_intel?.apt_groups?.some((g) => filters.aptGroups.includes(g))
        if (!hasGroup) return false
      }

      if (filters.malwareFamilies.length > 0) {
        const hasFamily = ioc.threat_intel?.malware_families?.some((m) => filters.malwareFamilies.includes(m))
        if (!hasFamily) return false
      }

      return true
    })
  }, [iocs, filters])

  const handleAnalyzeURLs = async (urls) => {
    setLoading(true)
    try {
      const response = await fetch("/api/analyze-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: urls.split(",").map((u) => u.trim()) }),
      })

      if (!response.ok) throw new Error(`API error: ${response.statusText}`)
      const data = await response.json()

      console.log(`server response from analyze-urls:`, data)

      setReport(data.report || null)
      setArabicReport(data.arabic_report || null)

      setIocs(data.iocs || [])
      setSelectedForEnrichment([])
      toast({
        title: "Analysis Complete",
        description: `Extracted ${data.iocs?.length || 0} IOCs`,
        variant: "default",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze URLs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnrichIOCs = async (selectedIOCs, selectedTools) => {
    setLoading(true)
    try {
      const selectedIOCObjects = iocs.filter((ioc) => selectedIOCs.includes(ioc.value))

      const response = await fetch("/api/enrich-iocs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ iocs: selectedIOCObjects, options: selectedTools }),
      })

      if (!response.ok) throw new Error(`Enrichment failed: ${response.statusText}`)
      const enrichedResponse = await response.json()

      if (!enrichedResponse.success || !enrichedResponse.data)
        throw new Error(`Enrichment failed: ${response.statusText}`)
      console.log(`server response from enrich iocs:`, enrichedResponse)

      const updatedIOCs = iocs.map((ioc) => {
        const enriched = enrichedResponse.data?.find((e) => e.value === ioc.value)
        return enriched || ioc
      })

      setIocs(updatedIOCs)
      toast({
        title: "Enrichment Complete",
        description: `${selectedIOCs.length} IOCs enriched`,
        variant: "default",
      })
    } catch (error) {
      console.error("Enrichment error:", error)
      toast({
        title: "Enrichment Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveIOC = (value) => {
    setIocs((prev) => prev.filter((ioc) => ioc.value !== value))
    if (selectedIOC?.value === value) setSelectedIOC(null)
    setSelectedForEnrichment((prev) => prev.filter((v) => v !== value))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <URLAnalyzerSection onAnalyze={handleAnalyzeURLs} loading={loading} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FiltersPanel iocs={iocs} filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <IOCDashboard
              iocs={filteredIOCs}
              selectedIOC={selectedIOC}
              onSelectIOC={setSelectedIOC}
              onRemoveIOC={handleRemoveIOC}
              onEnrich={handleEnrichIOCs}
              loading={loading}
              selectedForEnrichment={selectedForEnrichment}
              onEnrichmentSelectionChange={setSelectedForEnrichment}
            />

            {report && <ReportViewer report={report} arabic_report={arabic_report} onReportChange={setReport} />}
          </div>
        </div>
      </div>

      {selectedIOC && <IOCDetailsDrawer ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}

      <Toaster />
    </div>
  )
}

function FiltersPanel({ iocs, filters, onFiltersChange }) {
  const allTypes = [...new Set(iocs.map((ioc) => ioc.type))]
  const allRiskLevels = ["HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]
  const allAPTGroups = [...new Set(iocs.flatMap((ioc) => ioc.threat_intel?.apt_groups || []))]
  const allMalwareFamilies = [...new Set(iocs.flatMap((ioc) => ioc.threat_intel?.malware_families || []))]

  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-4">
      <h3 className="font-semibold text-foreground">Filters</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">IOC Type</label>
        <div className="space-y-1">
          {allTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filters.type.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked ? [...filters.type, type] : filters.type.filter((t) => t !== type)
                  onFiltersChange({ ...filters, type: newTypes })
                }}
                className="w-4 h-4"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Risk Level</label>
        <div className="space-y-1">
          {allRiskLevels.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filters.riskLevel.includes(level)}
                onChange={(e) => {
                  const newLevels = e.target.checked
                    ? [...filters.riskLevel, level]
                    : filters.riskLevel.filter((l) => l !== level)
                  onFiltersChange({ ...filters, riskLevel: newLevels })
                }}
                className="w-4 h-4"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      {allAPTGroups.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">APT Groups</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {allAPTGroups.map((group) => (
              <label key={group} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={filters.aptGroups.includes(group)}
                  onChange={(e) => {
                    const newGroups = e.target.checked
                      ? [...filters.aptGroups, group]
                      : filters.aptGroups.filter((g) => g !== group)
                    onFiltersChange({ ...filters, aptGroups: newGroups })
                  }}
                  className="w-4 h-4"
                />
                {group}
              </label>
            ))}
          </div>
        </div>
      )}

      {allMalwareFamilies.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Malware Families</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {allMalwareFamilies.map((family) => (
              <label key={family} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={filters.malwareFamilies.includes(family)}
                  onChange={(e) => {
                    const newFamilies = e.target.checked
                      ? [...filters.malwareFamilies, family]
                      : filters.malwareFamilies.filter((f) => f !== family)
                    onFiltersChange({ ...filters, malwareFamilies: newFamilies })
                  }}
                  className="w-4 h-4"
                />
                {family}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
