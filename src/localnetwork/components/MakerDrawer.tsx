import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Shield, Clock, MapPin, Truck, X, MessageSquare, Flag } from 'lucide-react';
import type { MakerProfile } from '@/localnetwork/data/types';

interface Props {
  maker: MakerProfile | null;
  open: boolean;
  onClose: () => void;
  onRequest: () => void;
}

export default function MakerDrawer({ maker, open, onClose, onRequest }: Props) {
  if (!maker) return null;

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[440px] p-0 flex flex-col overflow-hidden [&>button]:hidden">
        <div className="flex-shrink-0 border-b border-border">
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{maker.printer_type}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h2 className="text-xl font-bold text-foreground lowercase truncate">{maker.alias}</h2>
                {maker.verified && <Shield size={14} className="text-foreground/60" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 lowercase">{maker.city} · ~{maker.service_radius_km}km radius</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {maker.bio && <p className="text-sm text-foreground/80 leading-relaxed lowercase">{maker.bio}</p>}

          {(maker.capabilities?.length ?? 0) > 0 && (
            <Section label="capabilities">
              <div className="flex flex-wrap gap-1.5">
                {maker.capabilities.map(c => (
                  <span key={c} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-muted text-foreground/75 lowercase">
                    #{c.toLowerCase().replace(/[^a-z0-9]/g, '')}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {(maker.traits?.length ?? 0) > 0 && (
            <Section label="traits">
              <div className="flex flex-wrap gap-1.5">
                {maker.traits.map(t => (
                  <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-accent/40 text-accent-foreground/90 border border-accent/30 lowercase">
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {(maker.machines?.length ?? 0) > 0 ? (
            <Section label={`machines (${maker.machines.length})`}>
              <div className="space-y-2.5">
                {maker.machines.map((m, i) => (
                  <div key={m.id ?? i} className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground lowercase">
                        {m.printer_type}{m.machine_model ? ` · ${m.machine_model}` : ''}
                      </p>
                    </div>
                    {(m.build_volume || m.resolution || m.max_job_size) && (
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-muted-foreground lowercase">
                        {m.build_volume && <span>vol: {m.build_volume}</span>}
                        {m.resolution && <span>res: {m.resolution}</span>}
                        {m.max_job_size && <span>max: {m.max_job_size}</span>}
                      </div>
                    )}
                    {m.materials?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {m.materials.map(mat => (
                          <span key={mat} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-foreground/70 border border-border/40">
                            {mat}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.supplies && (
                      <p className="text-[11px] text-foreground/75 lowercase leading-snug pt-0.5">
                        <span className="text-muted-foreground">supplies: </span>{m.supplies}
                      </p>
                    )}
                    {m.notes && (
                      <p className="text-[11px] text-foreground/65 lowercase italic">{m.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <>
              <Section label="machine">
                <Row k="model" v={maker.machine_model} />
                <Row k="build volume" v={maker.build_volume} />
                <Row k="resolution" v={maker.resolution} />
                <Row k="max job size" v={maker.max_job_size} />
              </Section>
              {maker.materials?.length > 0 && (
                <Section label="materials">
                  <div className="flex flex-wrap gap-1.5">
                    {maker.materials.map(m => (
                      <span key={m} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-muted text-foreground/70">
                        {m}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          <Section label="logistics">
            <Row k="turnaround" v={maker.turnaround} icon={<Clock size={11} />} />
            <Row k="fulfillment" v={maker.fulfillment.join(' · ') || null} icon={<Truck size={11} />} />
            <Row k="price guidance" v={maker.price_guidance} />
          </Section>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare size={10} /> secure message
            </button>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Flag size={10} /> report
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card/50">
          <Button onClick={onRequest} className="w-full" disabled={maker.availability === 'offline'}>
            {maker.availability === 'offline' ? 'currently offline' : 'request a job'}
          </Button>
          <p className="text-[10px] text-muted-foreground/70 text-center mt-2 lowercase">
            requests are private. exact location is never shared.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ k, v, icon }: { k: string; v: string | null | undefined; icon?: React.ReactNode }) {
  if (!v) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground lowercase min-w-[90px] flex items-center gap-1">{icon}{k}</span>
      <span className="text-foreground lowercase flex-1">{v}</span>
    </div>
  );
}