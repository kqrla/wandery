import { useEffect } from "react";

const EXTERNAL_CONTRIBUTOR_URL = "https://example.com/contributor";

export default function ContributorDashboard() {
  useEffect(() => {
    window.location.replace(EXTERNAL_CONTRIBUTOR_URL);
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Redirecting to contributor portal…</p>
    </div>
  );
}