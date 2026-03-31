import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavBrand } from "@/components/nav-brand";
import { NavActions } from "@/components/nav-actions";
import { KenteStrip } from "@/components/kente-strip";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-midnight">
      <nav className="bg-midnight">
        <KenteStrip height="h-1" />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <NavBrand />
          <NavActions />
        </div>
        <div className="border-b border-[#2A2111]" />
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-8">{children}</main>
    </div>
  );
}
