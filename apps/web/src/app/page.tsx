import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KenteStrip } from "@/components/kente-strip";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream relative">
      {/* Kente strip at very top */}
      <KenteStrip height="h-2" />

      {/* Hero section */}
      <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
        {/* Eyebrow */}
        <p className="text-kente-gold text-xs font-sans font-medium uppercase tracking-[0.2em] mb-6">
          Studio photos in 60 seconds
        </p>

        {/* Headline */}
        <h1 className="font-syne font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-midnight mb-6">
          Your fabric.{" "}
          <span className="text-kente-gold">Their eyes.</span>
        </h1>

        {/* Subtext */}
        <p className="text-warm-muted text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Transform amateur product photos into professional social media posts
          — built for Zambian fashion boutiques.
        </p>

        {/* CTA button */}
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-3 bg-midnight text-cream font-sans font-medium text-base px-8 py-4 rounded-pill hover:bg-midnight/90 transition-colors group"
        >
          Start Creating
          <span className="w-8 h-8 rounded-full bg-kente-gold flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-midnight">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16 sm:pb-24">
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <div className="flex-1 bg-[#F0E6C8] rounded-card px-6 py-5 text-center">
            <p className="font-syne font-extrabold text-2xl sm:text-3xl text-[#7A5C1E] mb-1">60s</p>
            <p className="text-[#7A5C1E] text-sm font-sans">Photo to post</p>
          </div>
          <div className="flex-1 bg-[#F0E6C8] rounded-card px-6 py-5 text-center">
            <p className="font-syne font-extrabold text-2xl sm:text-3xl text-[#7A5C1E] mb-1">85%</p>
            <p className="text-[#7A5C1E] text-sm font-sans">Gross margin</p>
          </div>
        </div>
      </div>

      {/* Kente grid pattern overlay at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 28px,
              rgba(201, 168, 76, 0.08) 28px,
              rgba(201, 168, 76, 0.08) 29px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 28px,
              rgba(201, 168, 76, 0.08) 28px,
              rgba(201, 168, 76, 0.08) 29px
            )
          `,
        }}
      />
    </div>
  );
}
