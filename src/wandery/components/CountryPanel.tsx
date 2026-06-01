import { X } from "lucide-react";
import { affiliationsForCountry } from "@/wandery/data/filters";
import { religionsFor, languagesFor, colorForTag, type TagKind } from "@/wandery/data/identity";

interface Props {
  iso: string;
  name: string;
  year: number;
  onClose: () => void;
  onTag?: (kind: TagKind, tag: string) => void;
}

export default function CountryPanel({ iso, name, year, onClose, onTag }: Props) {
  const affs = affiliationsForCountry(iso);
  const rel = religionsFor(iso);
  const langs = languagesFor(iso);
  return (
    <aside className="pointer-events-auto w-[320px] max-w-[90vw] bg-card/85 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-md overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border/60 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">archived country · {iso}</div>
          <h2 className="font-serif text-2xl mt-1 leading-tight text-foreground">{name}</h2>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground -mr-2 -mt-1 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 py-4 space-y-4">
        <Section label="region affiliations">
          {affs.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">no active overlays touch this territory.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {affs.map(f => (
                <span
                  key={f.id}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-border/60"
                  style={{ background: `rgba(${f.color} / 0.22)`, color: "hsl(var(--foreground))" }}
                >
                  {f.label}
                </span>
              ))}
            </div>
          )}
        </Section>
        <Section label="religious affiliations">
          {rel.secular || rel.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {rel.secular && (
                <button
                  onClick={() => onTag?.("secular", "secular")}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-border/60 bg-muted/60 text-foreground hover:bg-muted transition-colors"
                >
                  #secular
                </button>
              )}
              {rel.tags.map(t => (
                <button
                  key={t}
                  onClick={() => onTag?.("religion", t)}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border hover:opacity-90 transition-opacity"
                  style={{
                    background: colorForTag("religion", t).replace(")", " / 0.22)"),
                    borderColor: colorForTag("religion", t).replace(")", " / 0.6)"),
                    color: "hsl(var(--foreground))",
                  }}
                >
                  #{t}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">unarchived.</p>
          )}
        </Section>
        <Section label="linguistic affiliations">
          {langs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => onTag?.("language", l)}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border hover:opacity-90 transition-opacity"
                  style={{
                    background: colorForTag("language", l).replace(")", " / 0.22)"),
                    borderColor: colorForTag("language", l).replace(")", " / 0.6)"),
                    color: "hsl(var(--foreground))",
                  }}
                >
                  #{l}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">unarchived.</p>
          )}
        </Section>
        <Section label="timeline">
          <p className="text-xs text-foreground/80 leading-relaxed">
            viewing the cartographic state of <span className="font-serif italic">{name}</span> circa{" "}
            <span className="font-mono">{year}</span>. borders, alliances and naming conventions
            shift quietly as the dial moves.
          </p>
        </Section>
        <Section label="notes">
          <p className="text-xs text-muted-foreground leading-relaxed">
            an atlas card. neighbouring regions, linguistic continuities and
            historical reconfigurations are archived as the dataset grows.
          </p>
        </Section>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}