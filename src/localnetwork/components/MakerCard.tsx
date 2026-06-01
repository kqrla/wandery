import { Zap, Clock, Truck, MapPin, Shield } from 'lucide-react';
import type { MakerProfile } from '@/localnetwork/data/types';

interface Props {
  maker: MakerProfile;
  onSelect: () => void;
  selected?: boolean;
  distanceKm?: number;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  available: { label: 'available now', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  busy:      { label: 'busy',          cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  offline:   { label: 'offline',       cls: 'bg-muted text-muted-foreground' },
};

export default function MakerCard({ maker, onSelect, selected, distanceKm }: Props) {
  const status = STATUS_LABEL[maker.availability] ?? STATUS_LABEL.offline;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-3.5 transition-all ${
        selected
          ? 'border-foreground bg-card shadow-sm'
          : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate lowercase">{maker.alias}</h3>
            {maker.verified && <Shield size={11} className="text-foreground/60 flex-shrink-0" />}
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
            {(() => {
              const types = Array.from(new Set([
                maker.printer_type,
                ...(maker.machines?.map(m => m.printer_type) ?? []),
              ]));
              if (types.length > 1) return `${types.length} machines · ${types.slice(0,3).join(' · ')}`;
              return `${maker.printer_type}${maker.machine_model ? ` · ${maker.machine_model}` : ''}`;
            })()}
          </p>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {(maker.materials?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {maker.materials.slice(0, 4).map(m => (
            <span key={m} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground/70">
              {m}
            </span>
          ))}
          {maker.materials.length > 4 && (
            <span className="text-[10px] font-mono text-muted-foreground/70">+{maker.materials.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {maker.turnaround && <span className="flex items-center gap-1"><Clock size={10} />{maker.turnaround}</span>}
        {maker.fulfillment.includes('pickup') && <span className="flex items-center gap-1"><MapPin size={10} />pickup</span>}
        {maker.fulfillment.includes('delivery') && <span className="flex items-center gap-1"><Truck size={10} />delivery</span>}
        {distanceKm != null && <span className="flex items-center gap-1"><Zap size={10} />{distanceKm.toFixed(1)} km</span>}
      </div>
    </button>
  );
}