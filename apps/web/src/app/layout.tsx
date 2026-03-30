import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThreadNation AI — Studio Photos in 60 Seconds",
  description:
    "Transform your product photos into professional social media posts. Built for Zambian fashion boutiques.",
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
          colorBackground: "#0D0D0D",
          colorInputBackground: "#1A1A1A",
          colorInputText: "#F5F0E8",
          colorText: "#F5F0E8",
          colorTextSecondary: "#8A8480",
          colorNeutral: "#2A2A2A",
          borderRadius: "8px",
        },
        elements: {
          card: "bg-surface-card border border-border shadow-none",
          headerTitle: "font-syne text-text-primary",
          headerSubtitle: "text-text-secondary",
          formButtonPrimary:
            "bg-accent text-accent-foreground hover:bg-accent/90 rounded-btn",
          formFieldInput:
            "bg-surface-card border-border text-text-primary rounded-input",
          footerActionLink: "text-accent hover:text-accent/80",
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
