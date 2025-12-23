"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SimpleBadge } from "@/components/ui/simple-badge"

const RISK_COLORS = {
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  INFORMATIONAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

export function IOCDetailsDrawer({ ioc, onClose }) {
  const [activeTab, setActiveTab] = useState("summary")
  const [expandedCampaigns, setExpandedCampaigns] = useState({})

  const toggleCampaign = (idx) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-2xl bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">IOC Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        <div className="flex border-b border-border bg-muted">
          {["summary", "threat_intel", "reputation", "raw"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "threat_intel"
                ? "Threat Intel"
                : tab === "raw"
                  ? "Raw JSON"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "summary" && <SummaryTab ioc={ioc} />}
          {activeTab === "threat_intel" && (
            <ThreatIntelTab ioc={ioc} expandedCampaigns={expandedCampaigns} toggleCampaign={toggleCampaign} />
          )}
          {activeTab === "reputation" && <ReputationTab ioc={ioc} />}
          {activeTab === "raw" && <RawJSONTab ioc={ioc} />}
        </div>
      </div>
    </div>
  )
}

function SummaryTab({ ioc }) {
  const riskLevel = ioc.scoring?.risk_level || "UNKNOWN"
  const score = ioc.scoring?.current_score || 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">IOC Value</p>
          <p className="font-mono text-sm break-all">{ioc.value}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Type</p>
          <SimpleBadge variant="outline" className="mt-1">
            {ioc.type.toUpperCase()}
          </SimpleBadge>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
          <SimpleBadge className={`${RISK_COLORS[riskLevel]} text-xs font-semibold mt-1`}>{riskLevel}</SimpleBadge>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Current Score</p>
          <p className="text-2xl font-bold text-foreground">{score.toFixed(1)}</p>
        </div>
      </div>

      {["md5", "sha1", "sha256"].includes(ioc.type) && (
        <div className="border border-border rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Hash Details</h4>
          <div className="text-sm space-y-1">
            <div className="flex">
              <span className="text-muted-foreground">MD5:</span>
              <span className="pl-5">{ioc.results?.virustotal?.md5 || ""}</span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground">SHA1:</span>
              <span className="pl-5">{ioc.results?.virustotal?.sha1 || ""}</span>
            </div>
            <div className="flex">
              <span className="text-muted-foreground">SHA256:</span>
              <span className="pl-5">{ioc.results?.virustotal?.sha256 || ""}</span>
            </div>
          </div>
        </div>
      )}

      {["md5", "sha1", "sha256"].includes(ioc.type) && (
        <div className="border border-border rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">File type</h4>
          <div className="text-sm space-y-1">
            <div className="flex">
              <span className="text-muted-foreground">extension:</span>
              <span className="pl-5">{ioc.results?.virustotal?.type || ""}</span>
            </div>

          </div>
        </div>
      )}

      {ioc.scoring && (
        <div className="border border-border rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm">Scoring Details</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Score:</span>
              <span>{ioc.scoring.base_score?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hours Since Seen:</span>
              <span>{ioc.scoring.hours_since_seen?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {ioc.threat_intel?.industries_targeted?.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Industries Targeted</h4>
          <div className="flex flex-wrap gap-2">
            {ioc.threat_intel.industries_targeted.map((industry) => (
              <SimpleBadge key={industry} variant="secondary" className="text-xs">
                {industry}
              </SimpleBadge>
            ))}
          </div>
        </div>
      )}

      {ioc.threat_intel?.targeted_countries?.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Targeted Countries</h4>
          <div className="flex flex-wrap gap-2">
            {ioc.threat_intel.targeted_countries
              .flat()
              .filter(Boolean)
              .map((country, index) => (
                <SimpleBadge key={index} variant="outline" className="text-xs">
                  {country}
                </SimpleBadge>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ThreatIntelTab({ ioc, expandedCampaigns, toggleCampaign }) {
  const threatIntel = ioc.threat_intel || {}

  return (
    <div className="space-y-4">
      {threatIntel.apt_groups?.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">APT Groups</h4>
          <div className="flex flex-wrap gap-2">
            {threatIntel.apt_groups.map((group) => (
              <SimpleBadge key={group} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                {group}
              </SimpleBadge>
            ))}
          </div>
        </div>
      )}

      {threatIntel.malware_families?.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">Malware Families</h4>
          <div className="flex flex-wrap gap-2">
            {threatIntel.malware_families.map((family) => (
              <SimpleBadge key={family} variant="outline" className="text-xs">
                {family}
              </SimpleBadge>
            ))}
          </div>
        </div>
      )}

      {threatIntel.campaigns?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm px-4">Campaigns</h4>
          {threatIntel.campaigns.map((campaign, idx) => (
            <div key={idx} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCampaign(idx)}
                className="w-full px-4 py-3 bg-muted hover:bg-muted/80 flex items-center justify-between transition-colors"
              >
                <span className="font-semibold text-sm text-left">{campaign.name}</span>
                <span>{expandedCampaigns[idx] ? "▲" : "▼"}</span>
              </button>

              {expandedCampaigns[idx] && (
                <div className="px-4 py-3 space-y-3 border-t border-border">
                  {campaign.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground">{campaign.description}</p>
                    </div>
                  )}
                  {campaign.tags?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {campaign.tags.map((tag) => (
                          <SimpleBadge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </SimpleBadge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(campaign.created || campaign.modified) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {campaign.created && <div>Created: {new Date(campaign.created).toLocaleDateString()}</div>}
                      {campaign.modified && <div>Modified: {new Date(campaign.modified).toLocaleDateString()}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReputationTab({ ioc }) {
  const results = ioc.results || {}

  return (
    <div className="space-y-4">
      {results.virustotal && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">VirusTotal</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {results.virustotal.malicious !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Malicious</p>
                <p className="font-semibold text-red-600">{results.virustotal.malicious}</p>
              </div>
            )}
            {results.virustotal.suspicious !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Suspicious</p>
                <p className="font-semibold text-yellow-600">{results.virustotal.suspicious}</p>
              </div>
            )}
            {results.virustotal.harmless !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Harmless</p>
                <p className="font-semibold text-green-600">{results.virustotal.harmless}</p>
              </div>
            )}
            {results.virustotal.asn && (
              <div>
                <p className="text-muted-foreground text-xs">ASN</p>
                <p className="font-semibold">{results.virustotal.asn}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {results.abuseipdb && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">AbuseIPDB</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Abuse Score</p>
              <p className="font-semibold">{results.abuseipdb.abuseScore}</p>
            </div>
            {results.abuseipdb.totalReports && (
              <div>
                <p className="text-muted-foreground text-xs">Total Reports</p>
                <p className="font-semibold">{results.abuseipdb.totalReports}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {results.alienvault && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">AlienVault OTX</h4>
          {results.alienvault.error ? (
            <p className="text-xs text-muted-foreground">{results.alienvault.error}</p>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-1">OTX Pulses</p>
              <p className="font-semibold">{results.alienvault.data?.count || 0}</p>
            </div>
          )}
        </div>
      )}

      {results.shodan && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">Shodan</h4>
          {results.shodan.error ? (
            <p className="text-xs text-muted-foreground">{results.shodan.error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Data available</p>
          )}
        </div>
      )}

      {results.ipinfo && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">IPInfo</h4>
          <div className="space-y-2 text-sm">
            {results.ipinfo.city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">City:</span>
                <span>{results.ipinfo.city}</span>
              </div>
            )}
            {results.ipinfo.country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Country:</span>
                <span>{results.ipinfo.country}</span>
              </div>
            )}
            {results.ipinfo.org && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization:</span>
                <span className="text-xs">{results.ipinfo.org}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RawJSONTab({ ioc }) {
  return (
    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
      <pre className="text-xs font-mono whitespace-pre-wrap break-words">{JSON.stringify(ioc, null, 2)}</pre>
    </div>
  )
}
