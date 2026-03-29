export default function HistoryPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">
          Your History
        </h1>
        <p className="text-text-secondary">
          Your last 5 generated posts.
        </p>
      </div>

      {/* History list placeholder — wired up in Session 4 */}
      <div className="border border-border rounded-card p-16 text-center bg-surface-card">
        <p className="text-text-secondary text-sm">
          History list coming in Session 4
        </p>
      </div>
    </div>
  );
}
