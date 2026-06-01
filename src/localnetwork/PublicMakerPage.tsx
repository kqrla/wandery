import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Clock, MapPin, Truck } from 'lucide-react';
import type { MakerProfile } from '@/localnetwork/data/types';
import { DEMO_MAKER } from '@/localnetwork/data/demo';
import { toHashtag } from '@/localnetwork/data/constants';

export default function PublicMakerPage() {
  const { alias } = useParams<{ alias: string }>();
  const [profile, setProfile] = useState<MakerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!alias) return;
    const clean = alias.replace(/^@/, '').toLowerCase();
    if (clean === 'demo_maker') {
      setProfile(DEMO_MAKER); setLoading(false); return;
    }
    supabase.from('maker_profiles').select('*').eq('alias', clean).eq('approved', true).maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setProfile(data as any);
        setLoading(false);
      });
  }, [alias]);

  if (loading) return <Center><p className="text-xs text-muted-foreground lowercase">loading…</p></Center>;

  if (notFound || !profile) {
    return (
      <Center>
        <p className="text-sm text-foreground lowercase mb-1">no public profile here.</p>
        <p className="text-xs text-muted-foreground lowercase mb-4">this maker may not exist yet, or is still pending manual review.</p>
        <Link to="/localnetwork"><Button variant="outline">back to map</Button></Link>
      </Center>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link to="/localnetwork" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> back to map
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">localnetwork / m / @{profile.alias}</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 pb-20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">@{profile.alias}</p>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-black text-foreground lowercase tracking-tight">{profile.alias}</h1>
              {profile.verified && <Shield size={18} className="text-foreground/60" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1 lowercase">
              {profile.printer_type} · {profile.city} · ~{profile.service_radius_km}km radius
            </p>
          </div>
          <Link to={`/localnetwork/request?maker=${profile.id}`}>
            <Button size="sm">request a job</Button>
          </Link>
        </div>

        {profile.bio && <p className="text-sm text-foreground/80 leading-relaxed lowercase mt-5">{profile.bio}</p>}

        {(profile.capabilities?.length ?? 0) > 0 && (
          <Block label="capabilities">
            <div className="flex flex-wrap gap-1.5">
              {profile.capabilities.map(c => (
                <span key={c} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-muted text-foreground/75">
                  {toHashtag(c)}
                </span>
              ))}
            </div>
          </Block>
        )}

        {(profile.traits?.length ?? 0) > 0 && (
          <Block label="known for">
            <div className="flex flex-wrap gap-1.5">
              {profile.traits.map(t => (
                <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-accent/40 text-accent-foreground/90 border border-accent/30 lowercase">{t}</span>
              ))}
            </div>
          </Block>
        )}

        {(profile.machines?.length ?? 0) > 0 && (
          <Block label={`machines (${profile.machines.length})`}>
            <div className="space-y-2">
              {profile.machines.map((m, i) => (
                <div key={m.id ?? i} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-semibold text-foreground lowercase">{m.printer_type}{m.machine_model ? ` · ${m.machine_model}` : ''}</p>
                  {(m.build_volume || m.resolution) && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 lowercase">
                      {m.build_volume && `vol: ${m.build_volume}`}{m.build_volume && m.resolution && ' · '}{m.resolution && `res: ${m.resolution}`}
                    </p>
                  )}
                  {m.materials?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.materials.map(mat => (
                        <span key={mat} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-foreground/70 border border-border/40">{mat}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Block>
        )}

        <Block label="logistics">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground lowercase">
            {profile.turnaround && <span className="flex items-center gap-1"><Clock size={11} />{profile.turnaround}</span>}
            {profile.fulfillment.includes('pickup') && <span className="flex items-center gap-1"><MapPin size={11} />pickup</span>}
            {profile.fulfillment.includes('delivery') && <span className="flex items-center gap-1"><Truck size={11} />delivery</span>}
            {profile.price_guidance && <span>{profile.price_guidance}</span>}
          </div>
        </Block>

        <p className="mt-10 text-[10px] text-muted-foreground/70 lowercase">
          public profile. exact location is never shown — only the approximate area within the service radius.
        </p>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {children}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">{children}</div>;
}
