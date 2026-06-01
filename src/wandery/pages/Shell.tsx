import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";

export default function Shell({ active, children }: { active?: string; children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const lnk = (k: string, to: string, label: string) => (
    <Link
      to={to}
      className={[
        "font-mono text-[11px] uppercase tracking-[0.22em] transition-colors",
        active === k ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* watercolor backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-70" style={{
        background:
          "radial-gradient(60% 50% at 20% 10%, rgba(222,200,232,0.55), transparent 70%)," +
          "radial-gradient(60% 50% at 90% 30%, rgba(247,225,215,0.55), transparent 70%)," +
          "radial-gradient(60% 60% at 50% 100%, rgba(237,175,184,0.35), transparent 75%)",
      }} />
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/65 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-[0.2em]">WANDERY</Link>
          <nav className="flex items-center gap-6">
            {lnk("about", "/about", "about")}
            {lnk("philosophy", "/philosophy", "philosophy")}
            {lnk("features", "/features", "features")}
            {lnk("roadmap", "/roadmap", "roadmap")}
            <Link to="/world" className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground border border-border/70 rounded-full px-3 py-1 hover:bg-card transition-colors">
              enter atlas
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">{children}</main>

      <footer className="border-t border-border/60 mt-20 bg-background/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>wandery · a living atlas</span>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-foreground">index</Link>
            <Link to="/world" className="hover:text-foreground">world</Link>
            <Link to="/europe" className="hover:text-foreground">europe</Link>
            <Link to="/about" className="hover:text-foreground">about</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">{children}</div>
  );
}

export function Display({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-foreground mb-8">{children}</h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-lg md:text-xl leading-relaxed text-foreground/85 mb-10 max-w-prose">{children}</p>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl md:text-3xl mt-14 mb-4 text-foreground">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-foreground/80 mb-4 max-w-prose">{children}</p>;
}

export function Rule() {
  return <hr className="my-12 border-border/60" />;
}