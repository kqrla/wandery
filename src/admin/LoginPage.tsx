import { useEffect } from "react";

const EXTERNAL_ADMIN_URL = "https://example.com/admin";

export default function AdminLogin() {
  useEffect(() => {
    window.location.replace(EXTERNAL_ADMIN_URL);
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Redirecting to admin…</p>
    </div>
  );
}