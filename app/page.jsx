"use client"

import { useState, useMemo, useEffect } from "react"
import { URLAnalyzerSection } from "@/components/url-analyzer-section"
import { IOCDashboard } from "@/components/ioc-dashboard"
import { IOCDetailsDrawer } from "@/components/ioc-details-drawer"
import { ReportViewer } from "@/components/report-viewer"
// import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  useEffect(() => {
    
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

      
  }, [])

  const [report, setReport] = useState("")
  const [iocs, setIocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIOC, setSelectedIOC] = useState(null)
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
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

      let response
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        response = getMockAnalysisResponse()
      } else {
        response = await fetch("/api/analyze-urls", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: urls.split(",").map((u) => u.trim()) }),
        })

        if (!response.ok) throw new Error(`API error: ${response.statusText}`)
        response = await response.json()

        console.log(`server response from analyze-urls :`)
        console.log(response)
      }

      setReport(response.report || "")
      setIocs(response.iocs || [])
      toast({
        title: "Analysis Complete",
        description: `Extracted ${response.iocs?.length || 0} IOCs`,
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

  const handleRemoveIOC = (value) => {
    setIocs((prev) => prev.filter((ioc) => ioc.value !== value))
    if (selectedIOC?.value === value) setSelectedIOC(null)
  }

  const handleEnrichIOCs = async (selectedIOCs, selectedTools) => {
    setLoading(true)
    try {
      const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

      let enrichedResponse
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        enrichedResponse = getMockEnrichmentResponse(selectedIOCs)

        const updatedIOCs = iocs.map((ioc) => {
          const enriched = enrichedResponse.find((e) => e.value === ioc.value)
          return enriched || ioc
        })

        setIocs(updatedIOCs)
        toast({
          title: "Enrichment Complete",
          description: `${selectedIOCs.length} IOCs enriched`,
          variant: "default",
        });


      } else {
        const response = await fetch("/api/enrich-iocs", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ iocs: selectedIOCs, options: selectedTools }),
        })

        if (!response.ok) throw new Error(`Enrichment failed: ${response.statusText}`)
        enrichedResponse = await response.json()

        if (!enrichedResponse.success || !enrichedResponse.data) throw new Error(`Enrichment failed: ${response.statusText}`)
        console.log(`server response from enrich iocs :`)
        console.log(enrichedResponse)

        const updatedIOCs = iocs.map((ioc) => {
          const enriched = enrichedResponse.data?.find((e) => e.value === ioc.value)
          return enriched || ioc
        })

        setIocs(updatedIOCs)
        toast({
          title: "Enrichment Complete",
          description: `${selectedIOCs.length} IOCs enriched`,
          variant: "default",
        });
      }


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

  return (
    <div className="min-h-screen bg-background">
      <URLAnalyzerSection onAnalyze={handleAnalyzeURLs} loading={loading} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filters Sidebar */}
          <div className="lg:col-span-1">
            <FiltersPanel iocs={iocs} filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Right: IOC Dashboard + Report */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* IOC Table (Dashboard Style) */}
            <IOCDashboard
              iocs={filteredIOCs}
              selectedIOC={selectedIOC}
              onSelectIOC={setSelectedIOC}
              onRemoveIOC={handleRemoveIOC}
              onEnrich={handleEnrichIOCs}
              loading={loading}
            />

            {/* Report Viewer */}
            {report && <ReportViewer report={report} onReportChange={setReport} />}
          </div>
        </div>
      </div>

      {/* IOC Details Drawer */}
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

      {/* Type Filter */}
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

      {/* Risk Level Filter */}
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

      {/* APT Groups Filter */}
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

      {/* Malware Families Filter */}
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

      {/* Score Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Score Range: {filters.scoreRange[0]} - {filters.scoreRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.scoreRange[1]}
          onChange={(e) => {
            onFiltersChange({
              ...filters,
              scoreRange: [filters.scoreRange[0], Number.parseInt(e.target.value)],
            })
          }}
          className="w-full"
        />
      </div>
    </div>
  )
}

function getMockAnalysisResponse() {
  return {
    report: `Water Gamayun APT Activity Report

Date: November 28, 2025

Executive Summary:
This report addresses activity attributed to the Water Gamayun APT group. The threat actor has been observed targeting multiple sectors with sophisticated attack techniques.

Technical Analysis:
Water Gamayun employs advanced evasion techniques and multi-stage payload delivery mechanisms. The group demonstrates knowledge of defense evasion and privilege escalation methods.

Key Findings:
- Primary targeting: Financial and technology sectors
- Attack vector: Phishing with credential harvesting
- Malware families: RAR-based downloaders, executables
- Infrastructure: Compromised domains and IP ranges

Recommendations:
1. Implement advanced email filtering and link analysis
2. Deploy behavioral analysis tools for process monitoring
3. Conduct immediate threat hunting on identified infrastructure
4. Review logs for suspicious RDP and lateral movement activity

Reference Links:
- https://www.zscaler.com/blogs/security-research/water-gamayun-apt`,
    iocs: [
      { value: "103.246.147.17", type: "ipv4" },
      { value: "http://belaysolutions.link", type: "url" },
      { value: "ba25573c5629cbc81c717e2810ea5afc", type: "md5" },
      { value: "admin.zscloud.net", type: "domain" },
    ],
  }
}

function getMockEnrichmentResponse(iocs) {
  const enrichmentMap = {
    "103.246.147.17": {
      value: "103.246.147.17",
      type: "ipv4",
      scoring: {
        current_score: 34.76,
        base_score: 42.45263157894737,
        hours_since_seen: 7.64,
        risk_level: "MEDIUM",
      },
      threat_intel: {
        apt_groups: ["Water Gamayun"],
        malware_families: ["Silentprism", "Darkwisp", "Rhadamanthys"],
        campaigns: [
          {
            name: "Water APT Multi-Stage Attack Uncovered",
            description: "Multi-stage attack with RAR payloads and PowerShell injection",
            tags: ["msc eviltwin", "cve-2025-26633"],
            created: "2025-11-26T00:43:16",
            modified: "2025-11-26T07:13:58",
          },
        ],
        industries_targeted: ["Technology", "Government"],
        targeted_countries: [["Russian Federation"]],
      },
      results: {
        virustotal: {
          malicious: 10,
          suspicious: 2,
          harmless: 55,
          asn: 211381,
          as_owner: "Podaon SIA",
          last_analysis_date: 1764365192,
        },
        abuseipdb: {
          abuseScore: 0,
          usageType: "Data Center/Web Hosting/Transit",
          isp: "Podaon SIA",
          totalReports: 1,
          countryCode: "NL",
        },
        alienvault: {
          data: { count: 3 },
        },
        shodan: {
          error: "Access denied (403 Forbidden)",
        },
        ipinfo: {
          city: "Oude Meer",
          country: "NL",
          org: "AS211381 Podaon SIA",
          loc: "52.2883,4.7861",
        },
      },
    },
    "http://belaysolutions.link": {
      value: "http://belaysolutions.link",
      type: "url",
      scoring: {
        current_score: 0,
        base_score: 32.39795918367347,
        hours_since_seen: 546.59,
        risk_level: "LOW",
      },
      threat_intel: {
        apt_groups: [],
        malware_families: [],
        campaigns: [
          {
            name: "Twitter Feed - skocherhan",
            description: "APT-related discussions",
            tags: ["APT"],
            created: "2025-10-10",
          },
        ],
        industries_targeted: [],
        targeted_countries: [],
      },
      results: {
        virustotal: {
          malicious: 14,
          suspicious: 1,
          harmless: 55,
          undetected: 28,
        },
        alienvault: {
          data: { count: 1 },
        },
      },
    },
    ba25573c5629cbc81c717e2810ea5afc: {
      value: "ba25573c5629cbc81c717e2810ea5afc",
      type: "md5",
      scoring: {
        current_score: 60.46,
        base_score: 60.460317460317455,
        hours_since_seen: 7.65,
        risk_level: "HIGH",
      },
      threat_intel: {
        apt_groups: ["Water Gamayun"],
        malware_families: ["Darkwisp", "Rhadamanthys", "Encrypthub", "Silentprism"],
        campaigns: [
          {
            name: "Water APT Multi-Stage Attack Uncovered",
            description: "RAR payload disguised as PDF with MSC EvilTwin exploit",
            tags: ["cve-2025-26633", "silentprism", "obfuscation"],
            created: "2025-11-26T00:43:16",
          },
        ],
        industries_targeted: ["Government", "Technology"],
        targeted_countries: [["Russian Federation"]],
      },
      results: {
        virustotal: {
          sha1: "8645a75947729d80223557409ae6ae4703429b1b",
          sha256: "8fdd2e21665d2e93fd2090a860a67ed1f2572fb5b94d0cf7ea6bc699f05e17c2",
          md5: "ba25573c5629cbc81c717e2810ea5afc",
          malicious: 22,
          suspicious: 0,
          harmless: 0,
          type: "RAR",
          names: ["Hiring_assistant.pdf.rar"],
        },
        alienvault: {
          data: { count: 4 },
        },
      },
    },
    "admin.zscloud.net": {
      value: "admin.zscloud.net",
      type: "domain",
      scoring: {
        current_score: 18.0,
        base_score: 18.0,
        risk_level: "INFORMATIONAL",
      },
      threat_intel: {
        apt_groups: [],
        malware_families: [],
        campaigns: [],
        industries_targeted: [],
        targeted_countries: [],
      },
      results: {
        virustotal: {
          malicious: 0,
          suspicious: 0,
          harmless: 63,
          registrar: "MarkMonitor Inc.",
          expiration_date: 1779907223,
        },
        alienvault: {
          data: { count: 0 },
        },
      },
    },
  }

  return iocs.map((ioc) => enrichmentMap[ioc.value] || ioc)
}
