"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-end gap-6 h-14">

          <div className="flex items-center text-foreground px-7 h-full">
            <Link
              href="/"
              className="text-sm font-medium transition-colors"
            >
              Home
            </Link>
          </div>

          <div className="flex items-center text-foreground px-7 h-full">
            <Link
              href="/adhoc"
              className="text-sm font-medium transition-colors"
            >
              Adhoc Enrichment
            </Link>

          </div>
        </div>
      </div>
    </nav>
  )
}
