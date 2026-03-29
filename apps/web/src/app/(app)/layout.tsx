import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

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
          <Link href="/dashboard">
            <span className="font-syne font-bold text-xl text-text-primary">
              ThreadNation{" "}
              <span className="text-accent">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Credit badge stub — wired up in Session 3 */}
            <div className="flex items-center gap-1.5 bg-surface-elevated border border-border rounded-btn px-3 py-1.5">
              <span className="text-accent text-sm">✦</span>
              <span className="text-text-secondary text-sm font-medium">
                Credits: –
              </span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
