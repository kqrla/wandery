import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Clock, X } from "lucide-react";

const MIN = 1200;
const MAX = 2025;
const STOPS = [1200, 1500, 1800, 1914, 1945, 1991, 2025];
const ERAS: Record<number, string> = {
  1200: "medieval cartography",
  1500: "age of empires",
  1800: "imperial cartography",
  1914: "the long summer",
  1945: "post-war redrawings",
  1991: "after the wall",
  2025: "present-day atlas",
};

interface Props { year: number; onYear: (y: number) => void }

const clampYear = (y: number) => Math.max(MIN, Math.min(MAX, y));

// Split a year into its four digits (always 4-wide; works for 1800..2025).
const digits = (y: number) => String(y).padStart(4, "0").split("").map(Number) as [number, number, number, number];
const fromDigits = (d: number[]) => clampYear(d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3]);

export default function TimelineDial({ year, onYear }: Props) {
  const [open, setOpen] = useState(false);
  const nearestStop = STOPS.reduce((p, s) => Math.abs(s - year) < Math.abs(p - year) ? s : p, STOPS[0]);
  const era = ERAS[year] ?? ERAS[nearestStop];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto group inline-flex items-center gap-2 bg-card/80 backdrop-blur-xl border border-border/70 rounded-full pl-3 pr-4 py-1.5 shadow-sm hover:bg-card transition-colors"
        title="open the timeline dial"
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">circa</span>
        <span className="font-serif text-lg leading-none text-foreground tabular-nums">{year}</span>
      </button>
    );
  }

  return (
    <div className="pointer-events-auto bg-card/85 backdrop-blur-2xl border border-border/70 rounded-2xl px-4 pt-3 pb-3 shadow-md w-[320px] animate-fade-in">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">timeline · dial</span>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground -mr-1 p-1">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* row of digit dials */}
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {digits(year).map((d, i) => (
          <DigitReel
            key={i}
            value={d}
            index={i}
            onChange={(nd) => {
              const arr = digits(year);
              arr[i] = nd;
              onYear(fromDigits(arr));
            }}
          />
        ))}
      </div>

      <div className="mt-3 text-center font-serif italic text-[12px] text-muted-foreground">{era}</div>

      {/* era stops — quick recall */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        {STOPS.map(y => (
          <button
            key={y}
            onClick={() => onYear(y)}
            className={[
              "font-mono text-[9px] tracking-wide hover:text-foreground transition-colors",
              y === year ? "text-foreground" : "text-muted-foreground/70",
            ].join(" ")}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── one rotary-style digit reel ───────────────────────────────────────────
// the digit slides up/down like a rotary phone wheel laid out in a straight
// row. supports click chevrons, mouse-wheel scrub and vertical drag.

function DigitReel({ value, index, onChange }: { value: number; index: number; onChange: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startV: number } | null>(null);

  // thousand digit is fixed at 1 or 2 (year range is 1200..2025).
  const allowed = index === 0 ? [1, 2] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const minV = allowed[0];
  const maxV = allowed[allowed.length - 1];

  const step = (delta: number) => {
    let n = value + delta;
    if (n < minV) n = maxV;
    if (n > maxV) n = minV;
    onChange(n);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      step(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startV: value };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    const next = dragRef.current.startV + Math.round(dy / 14);
    let n = ((next - minV) % (maxV - minV + 1) + (maxV - minV + 1)) % (maxV - minV + 1) + minV;
    if (n !== value) onChange(n);
  };
  const onPointerUp = () => { dragRef.current = null; };

  // we render 3 digits stacked (prev / current / next) and translate the
  // stack as `value` changes so the active digit always lands in the
  // centre window.
  const prev = value === minV ? maxV : value - 1;
  const next = value === maxV ? minV : value + 1;

  return (
    <div className="flex flex-col items-center select-none">
      <button onClick={() => step(-1)} className="text-muted-foreground/60 hover:text-foreground transition-colors">
        <ChevronUp className="h-3 w-3" />
      </button>
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="wd-reel relative h-[58px] w-10 my-1 rounded-md border border-border/70 bg-background/70 overflow-hidden cursor-ns-resize touch-none"
      >
        {/* subtle inner gradient masks for the reel illusion */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card to-transparent z-10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card to-transparent z-10" />
        <div
          key={value}
          className="absolute inset-0 flex flex-col items-center justify-center font-serif text-foreground tabular-nums"
          style={{ animation: "wd-reel-roll 220ms ease-out" }}
        >
          <span className="text-[10px] leading-none text-muted-foreground/50">{prev}</span>
          <span className="text-[22px] leading-none my-0.5">{value}</span>
          <span className="text-[10px] leading-none text-muted-foreground/50">{next}</span>
        </div>
      </div>
      <button onClick={() => step(1)} className="text-muted-foreground/60 hover:text-foreground transition-colors">
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}