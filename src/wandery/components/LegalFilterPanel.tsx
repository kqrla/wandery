import { X } from "lucide-react";
import { LEGAL_ORDER, LEGAL_SYSTEMS, type LegalSystem } from "@/wandery/data/legal";

interface Props {
  active: LegalSystem[];
  subActive: string[];
  onToggle: (s: LegalSystem) => void;
  onToggleSub: (subKey: string) => void;
  onClose: () => void;
}

export default function LegalFilterPanel({ active, subActive, onToggle, onToggleSub, onClose }: Props) {
  return (
    <aside className="pointer-events-auto w-[260px] bg-card/90 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-md overflow-hidden animate-fade-in">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border/60">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">filter · legal systems</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 -mr-1">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-[11px] text-muted-foreground italic leading-snug">
          countries lit up by tradition. hybrid jurisdictions wear the blended hue of the chips you've selected.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {LEGAL_ORDER.map(k => {
            const d = LEGAL_SYSTEMS[k];
            const on = active.includes(k);
            const rgb = `rgb(${d.rgb.join(",")})`;
            return (
              <div key={k} className="w-full">
                <button
                  onClick={() => onToggle(k)}
                  className={[
                    "font-mono text-[10px] px-2.5 py-1 rounded-full border transition-all",
                    on ? "border-transparent text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground bg-card/70",
                  ].join(" ")}
                  style={on ? {
                    background: `rgba(${d.rgb.join(",")} / 0.28)`,
                    boxShadow: `0 0 0 1px ${rgb}66, 0 4px 14px ${rgb}33`,
                  } : undefined}
                >
                  #{d.label.replace(" ", "-")}
                </button>
                {on && d.subs && (
                  <div className="mt-1.5 pl-2 ml-1 border-l border-border/50 flex flex-wrap gap-1">
                    {d.subs.map(s => {
                      const key = `${k}:${s.id}`;
                      const sOn = subActive.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => onToggleSub(key)}
                          className={[
                            "font-mono text-[9px] px-2 py-0.5 rounded-full border transition-all",
                            sOn ? "border-transparent text-foreground" : "border-border/50 text-muted-foreground/80 hover:text-foreground bg-card/60",
                          ].join(" ")}
                          style={sOn ? {
                            background: `rgba(${d.rgb.join(",")} / 0.22)`,
                            boxShadow: `0 0 0 1px ${rgb}55`,
                          } : undefined}
                        >
                          ↳ {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}