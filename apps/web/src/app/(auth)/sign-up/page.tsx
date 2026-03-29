import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">
            ThreadNation AI
          </h1>
          <p className="text-text-secondary">
            Start creating professional fashion posts today
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-surface-card border border-border shadow-none w-full",
              headerTitle: "font-syne text-text-primary",
              headerSubtitle: "text-text-secondary",
              formButtonPrimary:
                "bg-accent text-accent-foreground hover:bg-accent/90 rounded-btn font-medium",
              formFieldInput:
                "bg-background border-border text-text-primary rounded-input focus:ring-accent",
              formFieldLabel: "text-text-secondary",
              footerActionLink: "text-accent hover:text-accent/80",
              dividerLine: "bg-border",
              dividerText: "text-text-secondary",
              socialButtonsBlockButton:
                "bg-surface-elevated border-border text-text-primary hover:bg-surface-card",
            },
          }}
        />
      </div>
    </div>
  );
}
