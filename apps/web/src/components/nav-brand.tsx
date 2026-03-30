"use client"

import Link from "next/link"

export function NavBrand() {
  return (
    <Link href="/dashboard?r=1">
      <span className="font-syne font-bold text-xl text-text-primary whitespace-nowrap">
        ThreadNation <span className="text-accent">AI</span>
      </span>
    </Link>
  )
}
