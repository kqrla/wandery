import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { REGIONS, REGION_ORDER, OTHER_ORDER } from "@/wandery/data/regions";
import { useState } from "react";

export default function TopBrand({ region }: { region: string }) {
  const [open, setOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const nav = useNavigate();
  const r = REGIONS[region];
  const isOther = OTHER_ORDER.includes(region);
  return (
    <div className="pointer-events-auto flex flex-col items-center">
      <Link to="/" className="font-serif text-[28px] leading-none tracking-[0.18em] text-foreground/85 hover:text-foreground transition-colors">
        WANDERY
      </Link>
      <div className="relative mt-1.5">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {r?.label ?? "atlas"}
          <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-card/90 backdrop-blur-xl border border-border/70 rounded-xl shadow-md py-1 min-w-[180px] z-50">
            {REGION_ORDER.map(k => (
              <button
                key={k}
                onClick={() => { setOpen(false); nav(`/${k}`); }}
                className={[
                  "block w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  k === region ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {REGIONS[k].label}
              </button>
            ))}
            <div
              className="relative border-t border-border/60 mt-1 pt-1"
              onMouseEnter={() => setOtherOpen(true)}
              onMouseLeave={() => setOtherOpen(false)}
            >
              <button
                className={[
                  "flex w-full items-center justify-between px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                  isOther ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <span>other</span>
                <ChevronDown className="h-3 w-3 -rotate-90" />
              </button>
              {otherOpen && (
                <div className="absolute left-full top-0 ml-1 bg-card/95 backdrop-blur-xl border border-border/70 rounded-xl shadow-md py-1 min-w-[200px] z-50">
                  {OTHER_ORDER.map(k => (
                    <button
                      key={k}
                      onClick={() => { setOpen(false); setOtherOpen(false); nav(`/country/${k}`); }}
                      className={[
                        "block w-full text-left px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]",
                        k === region ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {REGIONS[k].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}