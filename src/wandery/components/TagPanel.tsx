import { X, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { loadCountries } from "@/wandery/lib/leaflet";
import {
  countriesForTag, colorForTag, religionsFor, languagesFor,
  type TagKind,
} from "@/wandery/data/identity";

interface Props {
  kind: TagKind;
  tag: string;
  onPickCountry: (iso: string, name: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function TagPanel({ kind, tag, onPickCountry, onBack, onClose }: Props) {
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancel = false;
    loadCountries().then((data: any) => {
      if (cancel) return;
      const map: Record<string, string> = {};
      data.features.forEach((f: any) => { if (f.id) map[f.id] = f.properties?.name ?? f.id; });
      setNames(map);
    });
    return () => { cancel = true; };
  }, []);

  const isos = countriesForTag(kind, tag);
  const header = kind === "secular" ? "#secular" : `#${tag}`;

  return (
    <aside className="pointer-events-auto w-[360px] max-w-[92vw] bg-card/85 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-md overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border/60 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <button onClick={onBack} className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> back
          </button>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-2">
            cross-tag · {kind}
          </div>
          <h2 className="font-serif text-2xl mt-1 leading-tight text-foreground truncate">{header}</h2>
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {isos.length} archived {isos.length === 1 ? "country" : "countries"}
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground -mr-2 -mt-1 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-2.5">
        {isos.length === 0 && (
          <p className="text-xs text-muted-foreground italic">no archived countries carry this tag yet.</p>
        )}
        {isos.map(iso => {
          const rel = religionsFor(iso);
          const langs = languagesFor(iso);
          const name = names[iso] ?? iso;
          return (
            <button
              key={iso}
              onClick={() => onPickCountry(iso, name)}
              className="w-full text-left rounded-xl border border-border/60 hover:border-foreground/40 bg-background/40 hover:bg-background/70 transition-colors px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-[15px] text-foreground truncate">{name}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{iso}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {rel.secular && (
                  <Pill text="#secular" color={colorForTag("secular", "secular")} active={kind==="secular"} />
                )}
                {rel.tags.map(t => (
                  <Pill key={"r"+t} text={`#${t}`} color={colorForTag("religion", t)} active={kind==="religion" && t===tag} />
                ))}
                {langs.map(l => (
                  <Pill key={"l"+l} text={`#${l}`} color={colorForTag("language", l)} active={kind==="language" && l===tag} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function Pill({ text, color, active }: { text: string; color: string; active?: boolean }) {
  return (
    <span
      className="font-mono text-[9.5px] px-1.5 py-0.5 rounded-full border"
      style={{
        background: `${color.replace("hsl(", "hsl(").replace(")", " / 0.18)")}`,
        borderColor: active ? color : "hsl(var(--border) / 0.7)",
        color: "hsl(var(--foreground))",
        boxShadow: active ? `0 0 0 1px ${color}` : undefined,
      }}
    >
      {text}
    </span>
  );
}