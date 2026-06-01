import { useEffect, useState } from "react";
import { REGIONS } from "@/wandery/data/regions";
import { filtersFor, type FilterId } from "@/wandery/data/filters";
import AtlasMap, { type ToggleState } from "@/wandery/components/AtlasMap";
import FilterChips from "@/wandery/components/FilterChips";
import MapControls from "@/wandery/components/MapControls";
import TimelineDial from "@/wandery/components/TimelineDial";
import TopBrand from "@/wandery/components/TopBrand";
import CountryPanel from "@/wandery/components/CountryPanel";
import TagPanel from "@/wandery/components/TagPanel";
import TagSpotlight from "@/wandery/components/TagSpotlight";
import LegalFilterPanel from "@/wandery/components/LegalFilterPanel";
import type { TagKind } from "@/wandery/data/identity";
import type { LegalSystem } from "@/wandery/data/legal";
import { COUNTRY_PAGE } from "@/wandery/data/history";
import { useNavigate } from "react-router-dom";

interface Props {
  region: string;
  /** when set, overrides displayed names for select ISOs (used by conflict pages) */
  labelOverrides?: Record<string, string>;
}

export default function Atlas({ region, labelOverrides }: Props) {
  const config = REGIONS[region] ?? REGIONS.world;
  const available = filtersFor(region);
  const nav = useNavigate();
  const [active, setActive] = useState<FilterId[]>([]);
  const [toggles, setToggles] = useState<ToggleState>({ labels: true, borders: true, terrain: false, pins: false });
  const [year, setYear] = useState(2025);
  const [picked, setPicked] = useState<{ iso: string; name: string } | null>(null);
  const [tagFocus, setTagFocus] = useState<{ kind: TagKind; tag: string } | null>(null);
  const [tagListOpen, setTagListOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalActive, setLegalActive] = useState<LegalSystem[]>([]);
  const [legalSubActive, setLegalSubActive] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ iso: string; name: string; x: number; y: number } | null>(null);

  // reset filters when region changes
  useEffect(() => {
    setActive([]); setPicked(null); setTagFocus(null); setTagListOpen(false);
    setLegalActive([]); setLegalSubActive([]); setLegalOpen(false); setMenu(null);
  }, [region]);

  // dismiss menu on any outside click / escape
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", esc); };
  }, [menu]);

  // body overflow is hidden globally — that's correct for the atlas surface
  useEffect(() => { document.body.style.overflow = "hidden"; }, []);

  const toggle = (id: FilterId) =>
    setActive(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <AtlasMap
        center={config.center}
        zoom={config.zoom}
        activeFilters={active}
        toggles={toggles}
        year={year}
        labelMode={config.labelMode ?? "countries"}
        subdivisionsUrl={config.subdivisionsUrl}
        highlightTag={tagFocus}
        legalActive={legalActive}
        legalSubActive={legalSubActive}
        labelOverrides={labelOverrides}
        onCountry={(iso, name) => setPicked({ iso, name })}
        onCountryContext={(iso, name, x, y) => setMenu({ iso, name, x, y })}
      />

      {/* atmospheric vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[10]" style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, rgba(255,245,240,0.0) 55%, rgba(80,50,70,0.10) 100%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(255,245,240,0.0) 60%, rgba(80,50,70,0.10) 100%)",
      }} />

      {/* top center brand */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[30]">
        <TopBrand region={region} />
      </div>

      {/* top-left meta */}
      <div className="absolute top-5 left-5 z-[30] pointer-events-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          atlas · {config.label}
        </div>
        <div className="mt-0.5 text-[11px] italic text-muted-foreground max-w-[220px] leading-snug">
          {config.blurb}
        </div>
      </div>

      {/* right side: map controls */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 z-[30]">
        <MapControls
          toggles={toggles}
          setToggles={setToggles}
          filterOpen={legalOpen}
          onToggleFilter={() => setLegalOpen(v => !v)}
        />
      </div>

      {/* legal-systems filter panel — anchors to the right rail */}
      {legalOpen && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 z-[40]">
          <LegalFilterPanel
            active={legalActive}
            subActive={legalSubActive}
            onToggle={(s) => setLegalActive(a => a.includes(s) ? a.filter(x => x !== s) : [...a, s])}
            onToggleSub={(k) => setLegalSubActive(a => a.includes(k) ? a.filter(x => x !== k) : [...a, k])}
            onClose={() => setLegalOpen(false)}
          />
        </div>
      )}

      {/* tag spotlight — always shown while a tag is focused */}
      {tagFocus && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[35]">
          <TagSpotlight
            kind={tagFocus.kind}
            tag={tagFocus.tag}
            listOpen={tagListOpen}
            onToggleList={() => setTagListOpen(v => !v)}
            onClose={() => { setTagFocus(null); setTagListOpen(false); }}
          />
        </div>
      )}

      {/* lower-left: timeline */}
      <div className="absolute bottom-24 left-5 z-[30]">
        <TimelineDial year={year} onYear={setYear} />
      </div>

      {/* bottom: filter chips */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[30] w-[min(96vw,1100px)]">
        <FilterChips available={available} active={active} onToggle={toggle} />
      </div>

      {/* country / tag panel */}
      {tagFocus && tagListOpen ? (
        <div className="absolute right-20 bottom-24 z-[40]">
          <TagPanel
            kind={tagFocus.kind}
            tag={tagFocus.tag}
            onPickCountry={(iso, name) => { setTagListOpen(false); setPicked({ iso, name }); }}
            onBack={() => setTagListOpen(false)}
            onClose={() => { setTagFocus(null); setTagListOpen(false); setPicked(null); }}
          />
        </div>
      ) : picked && (
        <div className="absolute right-20 bottom-24 z-[40]">
          <CountryPanel
            iso={picked.iso}
            name={picked.name}
            year={year}
            onClose={() => setPicked(null)}
            onTag={(kind, tag) => { setTagFocus({ kind, tag }); setTagListOpen(false); }}
          />
        </div>
      )}

      {/* right-click context menu */}
      {menu && (() => {
        const slug = COUNTRY_PAGE[menu.iso];
        const enabled = Boolean(slug);
        return (
          <div
            className="fixed z-[80] bg-card/95 backdrop-blur-xl border border-border/70 rounded-xl shadow-md py-1 min-w-[200px] animate-fade-in"
            style={{ left: menu.x, top: menu.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80 border-b border-border/60">
              {menu.name}
            </div>
            <button
              disabled={!enabled}
              onClick={() => { if (enabled) { setMenu(null); nav(`/country/${slug}`); } }}
              className={[
                "block w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                enabled ? "text-foreground hover:bg-muted/60" : "text-muted-foreground/40 cursor-not-allowed",
              ].join(" ")}
            >
              open country map
            </button>
            <button
              onClick={() => { setMenu(null); setPicked({ iso: menu.iso, name: menu.name }); }}
              className="block w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              show archive entry
            </button>
          </div>
        );
      })()}
    </div>
  );
}