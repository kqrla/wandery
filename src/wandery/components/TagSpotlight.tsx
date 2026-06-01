import { X, List, MapIcon } from "lucide-react";
import { colorForTag, countriesForTag, type TagKind } from "@/wandery/data/identity";

interface Props {
  kind: TagKind;
  tag: string;
  listOpen: boolean;
  onToggleList: () => void;
  onClose: () => void;
}

export default function TagSpotlight({ kind, tag, listOpen, onToggleList, onClose }: Props) {
  const color = colorForTag(kind, tag);
  const count = countriesForTag(kind, tag).length;
  return (
    <div
      className="pointer-events-auto inline-flex items-center gap-2 bg-card/90 backdrop-blur-2xl border rounded-full pl-3 pr-1.5 py-1 shadow-sm animate-fade-in"
      style={{ borderColor: color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[11px] tracking-wide text-foreground">
        #{tag}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        · {count} {count === 1 ? "country" : "countries"} lit
      </span>
      <button
        onClick={onToggleList}
        title={listOpen ? "hide list" : "show list"}
        className="ml-1 h-6 w-6 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
      >
        {listOpen ? <MapIcon className="h-3 w-3" /> : <List className="h-3 w-3" />}
      </button>
      <button
        onClick={onClose}
        className="h-6 w-6 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}