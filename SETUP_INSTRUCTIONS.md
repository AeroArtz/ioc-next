# Threat Intelligence Analyzer - Setup & Testing Guide

## Installation

No additional npm packages needed beyond the default v0 setup. All dependencies are auto-installed from imports.

## Environment Configuration

Create or update `.env.local` in your project root:

\`\`\`env
# For testing with mock data (default):
NEXT_PUBLIC_USE_MOCK_DATA=true

# For production with real backend:
NEXT_PUBLIC_USE_MOCK_DATA=false
\`\`\`

## Testing Without Backend

The app comes with comprehensive mock data built-in. To test:

1. **Start the app** - The mock data loads automatically
2. **Click "Analyze"** button (leave URL field empty or add any URLs)
3. **See results** - Mock IOCs and report populate after ~1.5s
4. **Enrich IOCs** - Click "Enrich" with pre-selected tools (~2s delay)
5. **Click on IOC rows** - Opens drawer with detailed analysis

## Testing with Real Backend

### Flask Backend Expected Endpoints

**1. POST /analyze-urls**

Request:
\`\`\`json
{
  "urls": ["https://example.com", "https://test.com"]
}
\`\`\`

Response:
\`\`\`json
{
  "report": "Markdown formatted report...",
  "iocs": [
    {
      "value": "103.246.147.17",
      "type": "ipv4"
    }
  ]
}
\`\`\`

**2. POST /enrich**

Request:
\`\`\`json
{
  "iocs": [
    {
      "value": "103.246.147.17",
      "type": "ipv4"
    }
  ],
  "tools": ["virustotal", "abuseipdb", "shodan", "alienvault", "ipinfo"]
}
\`\`\`

Response: Array of enriched IOCs with full structure (see mock data format in app/page.jsx)

### Starting Flask Backend

\`\`\`bash
# Make sure Flask is running on localhost:8888
python flask_app.py

# Then update .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
\`\`\`

## Features Overview

### Dashboard Layout

- **Left Sidebar**: Filters (Type, Risk Level, APT Groups, Malware Families, Score Range)
- **Center**: IOC Analysis Dashboard (searchable table with sorting)
- **Right**: Report Viewer (editable textarea)

### IOC Dashboard Columns

| Column | Description |
|--------|-------------|
| IOC Value | Color-coded by type (ipv4, url, domain, md5, sha256) |
| Type | IOC type badge |
| Risk | Risk level (HIGH/MEDIUM/LOW/INFO) |
| Score | Numeric risk score (0-100) |
| APT Groups | Primary APT group with "+more" indicator |
| Malware | Top malware families with "+more" |
| Reports | VT malicious count / AlienVault pulse count |
| Actions | Expand (drawer) / Delete buttons |

### IOC Details Drawer

Click any IOC row to open side panel with 4 tabs:

1. **Summary**: IOC details, risk level, score, industries, countries
2. **Threat Intel**: APT groups, malware families, campaigns (expandable)
3. **Reputation**: OSINT results from VirusTotal, AbuseIPDB, AlienVault, Shodan, IPInfo
4. **Raw JSON**: Full IOC data for export/debugging

### Enrichment Workflow

1. All visible IOCs are automatically "selected"
2. Delete unwanted IOCs with trash icon
3. Select/deselect enrichment tools in dropdown (all pre-selected)
4. Click "Enrich" button
5. Table updates with enriched data including scoring and threat intelligence

### Report Editor

- Click "Download" to export as `.txt` file
- Fully editable - modify text and re-download
- Supports multiline editing

## Mock Data Structure

The app includes 4 sample IOCs with full enrichment data:

- `103.246.147.17` (ipv4) - HIGH risk, Water Gamayun APT
- `http://belaysolutions.link` (url) - LOW risk
- `ba25573c5629cbc81c717e2810ea5afc` (md5) - HIGH risk, malicious hash
- `zscaler.com` (domain) - INFORMATIONAL risk, clean domain

Each includes:
- Risk scoring with decay parameters
- Threat intelligence (APT groups, malware families, campaigns)
- OSINT results from all 5 enrichment sources

## Keyboard Shortcuts

- **Enter** in URL field: Analyze
- **Click row**: Open IOC details drawer
- **Trash icon**: Delete IOC
- **Dropdown**: Select enrichment tools

## Performance Notes

- Mock analysis: ~1.5 seconds
- Mock enrichment: ~2 seconds
- Real backend calls should be proportional to API response times
- Large tables (100+ IOCs) support virtualization if needed

## Troubleshooting

**Enrichment tools not clickable?**
- Make sure dropdown menu is visible
- Click on tool name to toggle checkbox

**Drawer not opening?**
- Click on IOC row (not action buttons)
- Drawer slides in from right side

**Report not showing?**
- Click "Analyze" first
- Report appears below IOC table

**Data not persisting?**
- State is in-memory; refresh resets
- Download report before refreshing

## Backend Integration Checklist

- [ ] Flask server running on localhost:8888
- [ ] /analyze-urls endpoint returns correct structure
- [ ] /enrich endpoint accepts tools array
- [ ] CORS enabled for cross-origin requests
- [ ] Set NEXT_PUBLIC_USE_MOCK_DATA=false in .env.local
- [ ] Test with real data
