import { Link } from "react-router-dom";
import { ArrowRight, Compass, Layers, Clock, Scale, Flag, Sparkles, BookOpen, GitBranch } from "lucide-react";
import { useEffect } from "react";
import { FILTERS } from "@/wandery/data/filters";

export default function Landing() {
  // landing is now scrollable so the lower sections can be reached
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const sampleChips = ["eu", "schengen", "anglosphere", "nordic", "balkans", "francophone", "postsoviet"];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* ─────────────────────────── hero ─────────────────────────── */}
      <section className="relative h-screen overflow-hidden">
      {/* faded world map backdrop — static SVG-ish washed gradient */}
      <div aria-hidden className="absolute inset-0 opacity-[0.85]" style={{
        background:
          "radial-gradient(70% 55% at 22% 30%, rgba(237,175,184,0.48), transparent 70%)," +
          "radial-gradient(60% 50% at 75% 25%, rgba(247,225,215,0.55), transparent 72%)," +
          "radial-gradient(80% 60% at 60% 85%, rgba(222,200,232,0.45), transparent 75%)," +
          "linear-gradient(180deg, hsl(var(--background)), hsl(var(--muted)))",
      }} />

      {/* faint topo-like lines */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-[0.10]" preserveAspectRatio="none">
        <defs>
          <pattern id="topo" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 Q 30 30 60 60 T 120 60" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.4" />
            <path d="M0 90 Q 30 60 60 90 T 120 90" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.4" />
            <path d="M0 30 Q 30  0 60 30 T 120 30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>

      {/* drifting filter chips */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {sampleChips.map((id, i) => {
          const f = FILTERS[id];
          if (!f) return null;
          const top = [12, 70, 28, 80, 18, 65, 38][i] ?? 30;
          const left = [8, 16, 78, 70, 50, 88, 30][i] ?? 50;
          return (
            <span
              key={id}
              className="absolute font-mono text-[10px] tracking-wide px-2.5 py-1 rounded-full border border-border/50 backdrop-blur-md"
              style={{
                top: `${top}%`, left: `${left}%`,
                background: `rgba(${f.color} / 0.18)`,
                color: "hsl(var(--foreground) / 0.7)",
                animation: `wd-drift ${14 + i}s ease-in-out ${i * 0.6}s infinite alternate`,
              }}
            >
              {f.label}
            </span>
          );
        })}
      </div>

      {/* faint floating map pins */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {[[20,40],[34,62],[58,30],[72,55],[44,75],[82,68],[14,75]].map(([t,l],i) => (
          <span key={i} className="absolute h-2 w-2 rounded-full bg-foreground/40"
            style={{ top:`${t}%`, left:`${l}%`, boxShadow:"0 0 0 6px rgba(196,112,136,0.08), 0 0 22px 4px rgba(237,175,184,0.30)" }} />
        ))}
      </div>

      {/* center copy */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground mb-6">
          a living atlas
        </div>
        <h1 className="font-serif text-[clamp(64px,12vw,160px)] leading-none tracking-[0.08em] text-foreground/90">
          WANDERY
        </h1>
        <p className="mt-8 max-w-xl text-[15px] md:text-base leading-relaxed text-foreground/75 italic font-serif">
          explore borders, cultures, histories, and identities through an interactive living atlas.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/world"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-mono text-[11px] uppercase tracking-[0.24em] hover:opacity-90 transition-opacity shadow-sm"
          >
            enter atlas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/conflicts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 bg-card/70 backdrop-blur-xl font-mono text-[11px] uppercase tracking-[0.24em] text-foreground hover:bg-card transition-colors"
          >
            browse conflicts
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/about" className="hover:text-foreground">about</Link>
          <span className="opacity-40">·</span>
          <Link to="/philosophy" className="hover:text-foreground">philosophy</Link>
          <span className="opacity-40">·</span>
          <Link to="/features" className="hover:text-foreground">features</Link>
          <span className="opacity-40">·</span>
          <Link to="/roadmap" className="hover:text-foreground">roadmap</Link>
        </div>
      </div>

      {/* fake timeline preview */}
      <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60">
        <span>1200</span><span className="h-px w-10 bg-foreground/15" />
        <span>1500</span><span className="h-px w-10 bg-foreground/15" />
        <span>1800</span><span className="h-px w-10 bg-foreground/15" />
        <span>1914</span><span className="h-px w-10 bg-foreground/15" />
        <span>1945</span><span className="h-px w-10 bg-foreground/15" />
        <span className="text-foreground">2025</span>
      </div>
      </section>

      {/* ─────────────────────────── what's inside ─────────────────────────── */}
      <Sections />
    </div>
  );
}

// ─────────────────────────── sections ───────────────────────────

const HIGHLIGHTS: Array<{ icon: any; eyebrow: string; title: string; body: string; tint: string }> = [
  { icon: Compass, eyebrow: "atlas", title: "an uninterrupted canvas", body: "soft tiles, hushed labels, no chrome in the way. you move through geography the way you would through a quiet gallery.", tint: "rgba(237,175,184,0.45)" },
  { icon: Layers,  eyebrow: "overlays", title: "watercolour affiliations", body: "blocs, unions, languages, alliances — translucent washes that stack into mauve and dusk where they meet.", tint: "rgba(222,200,232,0.55)" },
  { icon: Clock,   eyebrow: "timeline", title: "1200 → 2025, dial-scrub", body: "drag a year and borders breathe. the british raj surfaces, the ussr returns, the holy roman empire flickers back into shape.", tint: "rgba(247,225,215,0.60)" },
  { icon: Scale,   eyebrow: "law", title: "legal systems, nested", body: "common, civil, religious, customary — broken down into napoleonic, germanic, sharia, halakha. hybrid jurisdictions render in the literal blend.", tint: "rgba(225,205,234,0.55)" },
  { icon: Flag,    eyebrow: "conflicts", title: "every border has two maps", body: "a catalogue of contested regions. each opens with a perspective dial: arab, imperial, neutral. names and lines move with it.", tint: "rgba(237,175,184,0.50)" },
  { icon: Sparkles, eyebrow: "identity", title: "cross-linked country cards", body: "click a country, see its blocs, religion, language and era tags — click any tag, the rest of the map lights up to match.", tint: "rgba(247,210,215,0.55)" },
];

const REGIONS: Array<{ to: string; label: string; sub: string }> = [
  { to: "/world",         label: "world",         sub: "the canonical surface" },
  { to: "/europe",        label: "europe",        sub: "blocs, unions, schengen" },
  { to: "/mena",          label: "mena",          sub: "north africa & west asia" },
  { to: "/asia",          label: "asia",          sub: "from the levant to the pacific" },
  { to: "/africa",        label: "africa",        sub: "fifty-four sovereignties" },
  { to: "/america",       label: "americas",      sub: "north, central, south" },
  { to: "/oceania",       label: "oceania",       sub: "archipelagos & atolls" },
  { to: "/conflicts",     label: "conflicts",     sub: "contested borders, perspectives" },
];

const SUBATLASES: Array<{ to: string; label: string; sub: string }> = [
  { to: "/country/unitedstates",  label: "united states",  sub: "50 states · dc · territories" },
  { to: "/country/canada",        label: "canada",         sub: "10 provinces · 3 territories" },
  { to: "/country/unitedkingdom", label: "united kingdom", sub: "four nations, devolved" },
  { to: "/country/australia",     label: "australia",      sub: "states & territories" },
  { to: "/country/newzealand",    label: "new zealand",    sub: "regions & motu" },
];

function Sections() {
  return (
    <>
      {/* what's inside */}
      <section className="relative px-6 py-24 border-t border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">what's inside</div>
          <h2 className="font-serif italic text-[40px] md:text-[52px] leading-[1.05] text-foreground/90 max-w-3xl">
            a quiet civic museum, rendered in cherry & thistle.
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HIGHLIGHTS.map(h => (
              <HighlightCard key={h.title} {...h} />
            ))}
          </div>
        </div>
      </section>

      {/* regions */}
      <section className="relative px-6 py-24 border-t border-border/60 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">enter by region</div>
          <h2 className="font-serif italic text-[36px] md:text-[44px] leading-[1.05] text-foreground/90 max-w-2xl">
            pick a continent, or a contested coastline.
          </h2>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
            {REGIONS.map(r => (
              <Link key={r.to} to={r.to} className="group rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 hover:border-foreground/30 hover:shadow-md transition-all">
                <div className="font-serif text-[22px] text-foreground/90 group-hover:text-foreground">{r.label}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{r.sub}</div>
                <div className="mt-4 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary/90 group-hover:translate-x-0.5 transition-transform">
                  open <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* country sub-atlases */}
      <section className="relative px-6 py-24 border-t border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-3">country sub-atlases</div>
          <h2 className="font-serif italic text-[36px] md:text-[44px] leading-[1.05] text-foreground/90 max-w-2xl">
            states, provinces, devolved nations.
          </h2>
          <p className="mt-4 max-w-xl text-[14px] italic text-muted-foreground">
            a handful of countries open into their own surfaces — internal divisions, overseas territories and all.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {SUBATLASES.map(s => (
              <Link key={s.to} to={s.to} className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-4 hover:border-foreground/30 hover:bg-card transition-colors">
                <BookOpen className="h-3.5 w-3.5 text-primary mb-2" />
                <div className="font-serif text-[18px] text-foreground/90">{s.label}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{s.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* philosophy strip */}
      <section className="relative px-6 py-28 border-t border-border/60 bg-gradient-to-b from-background to-muted/40">
        <div className="max-w-3xl mx-auto text-center">
          <GitBranch className="h-5 w-5 text-primary mx-auto mb-5" />
          <h2 className="font-serif italic text-[32px] md:text-[40px] leading-[1.1] text-foreground/90">
            "a map is never neutral. wandery just shows you whose hand it's drawn by."
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/philosophy" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/70 bg-card/70 backdrop-blur-xl font-mono text-[10px] uppercase tracking-[0.22em] text-foreground hover:bg-card transition-colors">
              read the philosophy
            </Link>
            <Link to="/roadmap" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/70 bg-card/70 backdrop-blur-xl font-mono text-[10px] uppercase tracking-[0.22em] text-foreground hover:bg-card transition-colors">
              see the roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border/60 px-6 py-10 bg-background">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>wandery · a living atlas · cherry & thistle</span>
          <div className="flex items-center gap-5">
            <Link to="/world" className="hover:text-foreground">world</Link>
            <Link to="/conflicts" className="hover:text-foreground">conflicts</Link>
            <Link to="/features" className="hover:text-foreground">features</Link>
            <Link to="/about" className="hover:text-foreground">about</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function HighlightCard({ icon: Icon, eyebrow, title, body, tint }: { icon: any; eyebrow: string; title: string; body: string; tint: string }) {
  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-6 overflow-hidden hover:border-foreground/30 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div aria-hidden className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-opacity" style={{ background: tint }} />
      <Icon className="relative h-4 w-4 text-primary mb-4" />
      <div className="relative font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{eyebrow}</div>
      <h3 className="relative font-serif text-[22px] leading-tight text-foreground mb-2">{title}</h3>
      <p className="relative text-[13px] leading-relaxed text-foreground/75">{body}</p>
    </div>
  );
}
