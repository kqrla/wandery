import { useRef, useLayoutEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { Location } from '@/data/locations';

const toHashtag = (cap: string) => '#' + cap.toLowerCase().replace(/[^a-z0-9]/g, '');

interface Props {
  location: Location;
  x: number;
  y: number;
  onClose: () => void;
  onTagClick: (cap: string) => void;
  onMoreInfo: () => void;
  selectedCaps: Set<string>;
  zIndex?: number;
}

export default function LocationCard({ location, x, y, onClose, onTagClick, onMoreInfo, selectedCaps, zIndex = 1001 }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const w = cardRef.current.offsetWidth;
    const h = cardRef.current.offsetHeight;
    const top = Math.max(8, Math.min(y - h - 62, window.innerHeight - h - 16));
    const left = Math.max(8, Math.min(x - w / 2, window.innerWidth - w - 8));
    setPos({ top, left });
  }, [x, y, location]);

  const colorVar = location.type === 'Library' ? '--lib-color' : location.type === 'University' ? '--uni-color' : '--make-color';
  const pinColor = `hsl(var(${colorVar}))`;

  return (
    <div
      ref={cardRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', zIndex,
        top: pos ? pos.top : y - 260, left: pos ? pos.left : x - 120,
        visibility: pos ? 'visible' : 'hidden', width: 252,
      }}
    >
      <div className="rounded-2xl shadow-xl overflow-hidden bg-card border border-border/40">
        {/* Colored header */}
        <div className="px-4 pt-3 pb-2.5 flex items-start justify-between gap-2" style={{ background: pinColor }}>
          <div>
            <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{location.type}</p>
            <h2 className="text-white font-bold text-sm leading-tight mt-0.5">{location.name}</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white flex-shrink-0 mt-1">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2.5">
          {(location.capabilities?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {location.capabilities!.map(cap => {
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

          {location.membershipCost && (
            <p className="text-[11px] text-muted-foreground leading-tight">
              <span className="font-semibold text-foreground">Access:</span> {location.membershipCost}
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
