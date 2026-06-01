import { useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MapView from "@/components/MapView";

// shared shell for marketing pages (/landing, /about, /features).
// renders a dimmed live map as a fixed backdrop so each page feels like
// it sits on top of the same quiet atlas. content is composed by children.

interface Props {
  children: ReactNode;
  active?: "landing" | "about" | "features";
}

export default function MarketingShell({ children, active }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const navClass = (key: string) =>
    active === key
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none opacity-[0.49]">
        <MapView
          locations={[]}
          initialCenter={[37.762, -122.435]}
          initialZoom={13}
          theme="default"
          onMarkerClick={() => {}}
          onMapClick={() => {}}
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/landing" className="font-mono text-sm font-semibold tracking-tight">
              fabnet
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link to="/about" className={navClass("about")}>about</Link>
              <Link to="/features" className={navClass("features")}>features</Link>
              <Link to="/" className="text-foreground font-medium inline-flex items-center gap-1">
                open map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="border-t border-border bg-background/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span className="font-mono">fabnet · a quiet atlas</span>
            <div className="flex items-center gap-5">
              <Link to="/landing" className="hover:text-foreground">home</Link>
              <Link to="/about" className="hover:text-foreground">about</Link>
              <Link to="/features" className="hover:text-foreground">features</Link>
              <Link to="/" className="hover:text-foreground">map</Link>
              <Link to="/localnetwork" className="hover:text-foreground">local network</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}