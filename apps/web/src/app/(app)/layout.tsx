import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavBrand } from "@/components/nav-brand";
import { NavActions } from "@/components/nav-actions";

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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavBrand />
          <NavActions />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
