import { useRef, useLayoutEffect, useState } from 'react';
import { X, ChevronRight, Shield } from 'lucide-react';
import type { MakerProfile } from '@/localnetwork/data/types';
import { toHashtag } from '@/localnetwork/data/constants';

const PRINTER_COLOR_VAR: Record<string, string> = {
  'FDM':           '--lib-color',
  'Resin':         '--make-color',
  'CNC':           '--uni-color',
  'Laser Cutter':  '--lib-color',
  'Vinyl Cutter':  '--make-color',
  'Other':         '--uni-color',
};

interface Props {
  maker: MakerProfile;
  x: number;
  y: number;
  onClose: () => void;
  onTagClick: (cap: string) => void;
  onMoreInfo: () => void;
  selectedCaps: Set<string>;
  zIndex?: number;
}

/**
 * Mirror of src/components/LocationCard — same layout, same hover/popover
 * pattern as the main fabnetwork map. Used when a user clicks a maker pin.
 */
export default function MakerCardPopover({
  maker, x, y, onClose, onTagClick, onMoreInfo, selectedCaps, zIndex = 1001,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const w = cardRef.current.offsetWidth;
    const h = cardRef.current.offsetHeight;
    const top = Math.max(8, Math.min(y - h - 62, window.innerHeight - h - 16));
    const left = Math.max(8, Math.min(x - w / 2, window.innerWidth - w - 8));
    setPos({ top, left });
  }, [x, y, maker.id]);

  const colorVar = PRINTER_COLOR_VAR[maker.printer_type] ?? '--make-color';
  const pinColor = `hsl(var(${colorVar}))`;

  const machineTypes = Array.from(new Set([
    maker.printer_type,
    ...(maker.machines?.map(m => m.printer_type) ?? []),
  ]));
  const headerSub = machineTypes.length > 1
    ? `${machineTypes.length} machines`
    : maker.printer_type;

  const caps = maker.capabilities ?? [];
  const traits = maker.traits ?? [];

  return (
    <div
      ref={cardRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', zIndex,
        top: pos ? pos.top : y - 260, left: pos ? pos.left : x - 120,
        visibility: pos ? 'visible' : 'hidden', width: 264,
      }}
    >
      <div className="rounded-2xl shadow-xl overflow-hidden bg-card border border-border/40">
        {/* Colored header */}
        <div className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2" style={{ background: pinColor }}>
          <div className="min-w-0">
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{headerSub}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h2 className="text-white font-bold text-sm leading-tight lowercase truncate">{maker.alias}</h2>
              {maker.verified && <Shield size={11} className="text-white/80 flex-shrink-0" />}
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white flex-shrink-0 mt-1">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2.5">
          {caps.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {caps.map(cap => {
                const active = selectedCaps.has(cap);
                return (
                  <button
                    key={cap}
                    onClick={() => onTagClick(cap)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                      active
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-muted text-foreground/65 border-transparent hover:border-foreground/20'
                    }`}
                  >
                    {toHashtag(cap)}
                  </button>
                );
              })}
            </div>
          )}

          {traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {traits.map(t => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-accent/40 text-accent-foreground/80 border border-accent/30 lowercase"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {maker.turnaround && (
            <p className="text-[11px] text-muted-foreground leading-tight lowercase">
              <span className="font-semibold text-foreground">turnaround:</span> {maker.turnaround}
            </p>
          )}

          <button
            onClick={onMoreInfo}
            className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70 w-full justify-end pt-0.5"
            style={{ color: pinColor }}
          >
            More info <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Triangle pointer */}
      <div className="flex justify-center">
        <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${pinColor}` }} />
      </div>
    </div>
  );
}