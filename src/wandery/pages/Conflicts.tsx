import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import { CONFLICTS, type ConflictDef } from "./Conflict";

// pretty labels for ISO codes used as party chips
const ISO_NAME: Record<string, string> = {
  USA:"united states", GBR:"united kingdom", FRA:"france", ESP:"spain", CAN:"canada",
  IND:"india", PAK:"pakistan", CHN:"china", TWN:"taiwan", ISR:"israel", PSE:"palestine",
  MAR:"morocco", ESH:"sahrawi (sadr)", UKR:"ukraine", RUS:"russia", CYP:"cyprus", TUR:"turkey",
  DNK:"denmark", GRL:"greenland", ARG:"argentina", CUB:"cuba", SYR:"syria",
};

function partyLabel(iso: string) { return ISO_NAME[iso] ?? iso.toLowerCase(); }

export default function Conflicts() {
  const [filter, setFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const popRef = useRef<HTMLDivElement | null>(null);

  // allow this page to scroll even though body is overflow:hidden globally
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // close popover on outside click / escape
  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setFilterOpen(false); };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [filterOpen]);

  const all = useMemo(() => Object.values(CONFLICTS), []);

  // build sorted unique party list for filter chips
  const parties = useMemo(() => {
    const s = new Set<string>();
    all.forEach(c => { c.parties.forEach(p => s.add(p)); (c.allies ?? []).forEach(p => s.add(p)); });
    return Array.from(s).sort((a, b) => partyLabel(a).localeCompare(partyLabel(b)));
  }, [all]);

  // autocomplete suggestions based on user query
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parties.slice(0, 8);
    return parties.filter(iso => partyLabel(iso).toLowerCase().includes(q) || iso.toLowerCase().includes(q)).slice(0, 12);
  }, [query, parties]);

  // when filter is set, primary cards = parties include filter; ally cards = allies include filter
  const cards: Array<{ c: ConflictDef; ally: boolean }> = useMemo(() => {
    if (!filter) return all.map(c => ({ c, ally: false }));
    const out: Array<{ c: ConflictDef; ally: boolean }> = [];
    all.forEach(c => {
      const isParty = c.parties.includes(filter);
      const isAlly = !isParty && (c.allies ?? []).includes(filter);
      if (isParty) out.push({ c, ally: false });
      else if (isAlly) out.push({ c, ally: true });
    });
    return out;
  }, [all, filter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-[1100px] mx-auto px-6 pt-12 pb-8">
        <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors">
          ← index
        </Link>
        <h1 className="mt-6 font-serif italic text-[44px] leading-none text-foreground/90">conflicts</h1>
        <p className="mt-3 max-w-[640px] text-[13px] leading-relaxed text-muted-foreground italic">
          disputed or contested regions with border conflicts as well as global catalog of sovereignty
          disputes (tied to autonomy, identity and map representation) with each side's cartographic perspective.
        </p>

        {/* collapsed filter — icon button with autocomplete */}
        <div className="mt-7 relative inline-block" ref={popRef}>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={[
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card/70 backdrop-blur-md",
              "font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
              filter ? "border-foreground/60 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground",
            ].join(" ")}
            aria-expanded={filterOpen}
          >
            <Filter className="h-3 w-3" />
            <span>filter{filter ? ` · ${partyLabel(filter)}` : ""}</span>
            {filter && (
              <span
                role="button"
                aria-label="clear filter"
                onClick={(e) => { e.stopPropagation(); setFilter(null); }}
                className="ml-1 inline-flex items-center justify-center rounded-full hover:bg-muted/60 p-0.5"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[300px] rounded-xl border border-border/70 bg-popover/95 backdrop-blur-xl shadow-md p-2">
              <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/60">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="type a country…"
                  className="flex-1 bg-transparent outline-none text-[12px] text-foreground placeholder:text-muted-foreground/70"
                />
              </div>
              <div className="max-h-[240px] overflow-y-auto py-1">
                {suggestions.length === 0 && (
                  <div className="px-3 py-2 text-[11px] italic text-muted-foreground">no matches</div>
                )}
                {suggestions.map(iso => (
                  <button
                    key={iso}
                    onClick={() => { setFilter(iso); setFilterOpen(false); setQuery(""); }}
                    className="w-full text-left px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    #{partyLabel(iso).replace(/\s+/g, "-")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ c, ally }) => (
            <Link
              key={c.id}
              to={`/conflict/${c.id}`}
              className={[
                "relative block text-left rounded-2xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5",
                ally ? "opacity-50 hover:opacity-80 border-border/50" : "border-border/70 hover:border-foreground/30",
              ].join(" ")}
            >
              {ally && (
                <div className="absolute top-3 right-3 font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground bg-accent/40 border border-border/60 rounded-full px-2 py-0.5">
                  supports as primary ally
                </div>
              )}
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80">
                /conflict/{c.id}
              </div>
              <div className="mt-2 font-serif italic text-[24px] leading-tight text-foreground/90">
                {c.label}
              </div>
              <p className="mt-2 text-[12px] leading-snug italic text-muted-foreground">{c.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1">
                {c.parties.map(p => (
                  <span key={p} className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground bg-muted/60 border border-border/40 rounded-full px-2 py-0.5">
                    {partyLabel(p)}
                  </span>
                ))}
                {(c.allies ?? []).map(p => (
                  <span key={"a"+p} className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/80 border border-dashed border-border/60 rounded-full px-2 py-0.5">
                    ally · {partyLabel(p)}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {!cards.length && (
            <div className="col-span-full text-center text-muted-foreground italic py-12">
              no conflicts found for this party.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}