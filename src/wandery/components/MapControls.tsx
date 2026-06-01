import { Layers, Tag, Mountain, Square, MapPin, SlidersHorizontal } from "lucide-react";
import type { ToggleState } from "./AtlasMap";

interface Props {
  toggles: ToggleState;
  setToggles: (t: ToggleState) => void;
  filterOpen?: boolean;
  onToggleFilter?: () => void;
}

const Btn = ({ on, onClick, title, children }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={[
      "h-8 w-8 grid place-items-center rounded-md border transition-colors",
      on
        ? "bg-card text-foreground border-border shadow-xs"
        : "bg-card/60 text-muted-foreground border-border/60 backdrop-blur-md hover:text-foreground",
    ].join(" ")}
  >
    {children}
  </button>
);

export default function MapControls({ toggles, setToggles, filterOpen, onToggleFilter }: Props) {
  const set = (k: keyof ToggleState) => () => setToggles({ ...toggles, [k]: !toggles[k] });
  return (
    <div className="pointer-events-auto flex flex-col gap-1.5">
      <Btn on={toggles.labels}  onClick={set("labels")}  title="labels"><Tag className="h-3.5 w-3.5" /></Btn>
      <Btn on={!!filterOpen}    onClick={onToggleFilter} title="filter"><SlidersHorizontal className="h-3.5 w-3.5" /></Btn>
      <Btn on={toggles.borders} onClick={set("borders")} title="borders"><Square className="h-3.5 w-3.5" /></Btn>
      <Btn on={toggles.terrain} onClick={set("terrain")} title="terrain"><Mountain className="h-3.5 w-3.5" /></Btn>
      <Btn on={toggles.pins}    onClick={set("pins")}    title="pins"><MapPin className="h-3.5 w-3.5" /></Btn>
      <Btn on={true}            onClick={() => {}}       title="layers"><Layers className="h-3.5 w-3.5" /></Btn>
    </div>
  );
}