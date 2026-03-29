export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">
          Create Your Post
        </h1>
        <p className="text-text-secondary">
          Upload a photo of your garment to generate a studio-quality social
          media post.
        </p>
      </div>

      {/* Upload zone placeholder — wired up in Session 3 */}
      <div className="border-2 border-dashed border-border rounded-card p-16 text-center bg-surface-card">
        <p className="text-text-secondary text-sm">
          Upload zone coming in Session 3
        </p>
      </div>
    </div>
  );
}
