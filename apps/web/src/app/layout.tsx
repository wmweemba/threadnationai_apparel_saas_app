import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThreadNation AI — Studio Photos in 60 Seconds",
  description:
    "Transform your product photos into professional social media posts. Built for Zambian fashion boutiques.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ThreadNation AI",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A84C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#C9A84C",
          colorBackground: "#0F0A04",
          colorInputBackground: "#1A1209",
          colorInputText: "#F5F0E8",
          colorText: "#F5F0E8",
          colorTextSecondary: "#9A8A72",
          colorNeutral: "#2A2111",
          borderRadius: "8px",
        },
        elements: {
          card: "bg-surface-card border border-[rgba(255,255,255,0.08)] shadow-none",
          headerTitle: "font-syne text-text-primary",
          headerSubtitle: "text-warm-dim",
          formButtonPrimary:
            "bg-kente-gold text-midnight hover:bg-kente-gold/90 rounded-btn font-bold",
          formFieldInput:
            "bg-surface-card border-[rgba(255,255,255,0.08)] text-text-primary rounded-input",
          footerActionLink: "text-kente-gold hover:text-kente-gold/80",
          userButtonPopoverCard:
            "!bg-[#1A1209] !border !border-[rgba(255,255,255,0.12)] !shadow-2xl",
          userButtonPopoverActionButton:
            "!text-[#F5F0E8] hover:!bg-[#241C10]",
          userButtonPopoverActionButtonText: "!text-[#F5F0E8]",
          userButtonPopoverActionButtonIcon: "!text-[#9A8A72]",
          userButtonPopoverFooter: "!hidden",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
