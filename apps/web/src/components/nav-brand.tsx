"use client"

import Link from "next/link"

export function NavBrand() {
  return (
    <Link href="/dashboard?r=1">
      <span className="font-syne font-extrabold text-base sm:text-xl text-cream whitespace-nowrap">
        ThreadNation <span className="text-kente-gold">AI</span>
      </span>
    </Link>
  )
}
