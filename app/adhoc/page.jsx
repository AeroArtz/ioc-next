"use client"

import { useState, useEffect } from "react"
import { AdhocIOCAnalyzerSection } from "@/components/adhoc-ioc-analyzer-section"
import { AdhocIOCDashboard } from "@/components/adhoc-ioc-dashboard"
import { IOCDetailsDrawer } from "@/components/ioc-details-drawer"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"

export default function AdhocIOCAnalyze() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  const [iocs, setIocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIOC, setSelectedIOC] = useState(null)
  const [selectedTools, setSelectedTools] = useState([
    "virustotal",
    "abuseipdb",
    "shodan",
    "alienvault",
    "ipinfo",
    "urlscan",
    "threatfox",
  ])
  const { toast } = useToast()

  // Function to split IOCs by comma or newline
  const parseIOCs = (input) => {
    // Split by comma or newline, trim whitespace, filter empty strings
    return input
      .split(/[,\n]+/)
      .map((ioc) => ioc.trim())
      .filter((ioc) => ioc.length > 0)
  }

  // Function to detect IOC type
  const detectIOCType = (value) => {
    // IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return "ipv4"
    // URL
    if (/^https?:\/\//i.test(value)) return "url"
    // MD5
    if (/^[a-f0-9]{32}$/i.test(value)) return "md5"
    // SHA1
    if (/^[a-f0-9]{40}$/i.test(value)) return "sha1"
    // SHA256
    if (/^[a-f0-9]{64}$/i.test(value)) return "sha256"
    // Domain (basic check)
    if (/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(value)) return "domain"

    return "unknown"
  }

  const handleEnrichIOCs = async (iocInput) => {
    setLoading(true)
    try {
      // Parse the input to get array of IOC strings
      const iocStrings = parseIOCs(iocInput)

      if (iocStrings.length === 0) {
        toast({
          title: "No IOCs Found",
          description: "Please enter at least one IOC",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Call the enrichment API
      const response = await fetch("/api/adhoc-enrich-iocs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          iocs: iocStrings,
          options: selectedTools,
        }),
      })

      if (!response.ok) {
        throw new Error(`Enrichment failed: ${response.statusText}`)
      }

      const enrichedResponse = await response.json()
      console.log("Enrichment response:", enrichedResponse)

      if (!enrichedResponse.success || !enrichedResponse.data) {
        throw new Error("Enrichment failed: Invalid response")
      }

      // Set the enriched IOCs
      setIocs(enrichedResponse.data)

      toast({
        title: "Enrichment Complete",
        description: `Successfully enriched ${enrichedResponse.data.length} IOCs`,
        variant: "default",
      })
    } catch (error) {
      console.error("Enrichment error:", error)
      toast({
        title: "Enrichment Failed",
        description: error.message || "Failed to enrich IOCs",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <AdhocIOCAnalyzerSection
        onEnrich={handleEnrichIOCs}
        loading={loading}
        selectedTools={selectedTools}
        onToolsChange={setSelectedTools}
      />

      <div className="container mx-auto px-4 py-8">
        <AdhocIOCDashboard iocs={iocs} onSelectIOC={setSelectedIOC} onRemoveIOC={handleRemoveIOC} />
      </div>

      {selectedIOC && <IOCDetailsDrawer ioc={selectedIOC} onClose={() => setSelectedIOC(null)} />}

      <Toaster />
    </div>
  )
}
