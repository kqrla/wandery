import { FILTERS, type FilterId } from "@/wandery/data/filters";

interface Props {
  available: FilterId[];
  active: FilterId[];
  onToggle: (id: FilterId) => void;
}

export default function FilterChips({ available, active, onToggle }: Props) {
  return (
    <div className="pointer-events-auto max-w-[min(96vw,1100px)] overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 px-1 py-2">
        {available.map(id => {
          const f = FILTERS[id];
          if (!f) return null;
          const on = active.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={[
                "shrink-0 rounded-full px-3 py-1 font-mono text-[11px] tracking-wide",
                "border transition-all duration-300",
                on
                  ? "border-transparent text-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:text-foreground bg-card/70 backdrop-blur-md",
              ].join(" ")}
              style={on ? {
                background: `rgba(${f.color} / 0.28)`,
                boxShadow: `0 0 0 1px rgba(${f.color} / 0.45), 0 4px 18px rgba(${f.color} / 0.18)`,
              } : undefined}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}