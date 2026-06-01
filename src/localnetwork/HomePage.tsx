import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NetworkMap from '@/localnetwork/components/NetworkMap';
import MakerCard from '@/localnetwork/components/MakerCard';
import MakerDrawer from '@/localnetwork/components/MakerDrawer';
import MakerCardPopover from '@/localnetwork/components/MakerCardPopover';
import { NETWORK_CITIES } from '@/localnetwork/data/constants';
import type { MakerProfile } from '@/localnetwork/data/types';
import { useSession } from '@/localnetwork/hooks/useSession';
import { Toaster } from '@/components/ui/sonner';
import { ChevronDown, Plus, FileUp, LayoutDashboard, Filter, X, MapPin, Search } from 'lucide-react';

export default function LocalNetworkHome() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [city, setCity] = useState(NETWORK_CITIES[0]);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [makers, setMakers] = useState<MakerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCaps, setActiveCaps] = useState<Set<string>>(new Set());
  const [availableNow, setAvailableNow] = useState(false);
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [selected, setSelected] = useState<MakerProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popover, setPopover] = useState<{ maker: MakerProfile; x: number; y: number } | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [zipInput, setZipInput] = useState('');
  const [activeZip, setActiveZip] = useState('');
  const [zipError, setZipError] = useState('');
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .from('maker_profiles')
      .select('*')
      .eq('approved', true)
      .eq('city', city.name)
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) console.error(error);
        setMakers((data ?? []).map(normalize));
        setLoading(false);
      });
    return () => { cancel = true; };
  }, [city.name]);

  const filtered = useMemo(() => {
    return makers.filter(m => {
      if (activeCaps.size > 0) {
        const caps = m.capabilities ?? [];
        let any = false;
        activeCaps.forEach(c => { if (caps.includes(c)) any = true; });
        if (!any) return false;
      }
      if (availableNow && m.availability !== 'available') return false;
      if (sameDayOnly && !(m.turnaround?.toLowerCase().includes('same-day') || m.turnaround?.toLowerCase().includes('24'))) return false;
      if (activeZip && m.zip !== activeZip) return false;
      return true;
    });
  }, [makers, activeCaps, availableNow, sameDayOnly, activeZip]);

  function toggleCap(c: string) {
    setActiveCaps(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  function switchCity(c: typeof city) {
    setCity(c);
    setCityMenuOpen(false);
    setSelected(null);
    setDrawerOpen(false);
    setPopover(null);
    setActiveZip(''); setZipInput(''); setZipError('');
    mapRef.current?.setView(c.center, c.zoom);
  }

  function applyZip() {
    const z = zipInput.trim();
    if (!z) { setActiveZip(''); setZipError(''); return; }
    const coords = city.zips[z];
    if (!coords) { setZipError(`not a valid zip for ${city.name.toLowerCase()}.`); return; }
    setZipError('');
    setActiveZip(z);
    mapRef.current?.setView(coords, 14);
  }

  function clearZip() {
    setActiveZip(''); setZipInput(''); setZipError('');
    mapRef.current?.setView(city.center, city.zoom);
  }

  function selectMaker(m: MakerProfile) {
    setSelected(m);
    setPopover(null);
    mapRef.current?.flyTo([m.approx_lat, m.approx_lng], 14, { duration: 0.6 });
    // After fly, show popover at the screen position of the maker
    setTimeout(() => {
      const map = mapRef.current; if (!map) return;
      const pt = map.latLngToContainerPoint([m.approx_lat, m.approx_lng]);
      setPopover({ maker: m, x: pt.x, y: pt.y });
    }, 650);
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-background" onClick={() => { setCityMenuOpen(false); setPopover(null); }}>
      <NetworkMap
        makers={filtered}
        center={city.center}
        zoom={city.zoom}
        highlightedId={selected?.id ?? null}
        onMarkerClick={(m, x, y) => { setSelected(m); setDrawerOpen(false); setPopover({ maker: m, x, y }); }}
        onMapClick={() => { setSelected(null); setCityMenuOpen(false); setPopover(null); }}
        onReady={map => { mapRef.current = map; }}
      />

      {/* Top bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] text-center" onClick={e => e.stopPropagation()}>
        <h1 className="font-black uppercase leading-none tracking-tight text-foreground select-none text-center" style={{ fontSize: '1.25rem' }}>
          localnetwork
        </h1>
        <div className="relative mt-2 flex justify-center">
          <button
            onClick={() => setCityMenuOpen(o => !o)}
            className="flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm border border-border/60 rounded-full px-2.5 py-1"
          >
            {city.name}
            <ChevronDown size={9} className={`transition-transform ${cityMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {cityMenuOpen && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[170px] z-[1002]">
              {NETWORK_CITIES.map(c => (
                <button key={c.id} onClick={() => switchCity(c)}
                  className={`w-full px-4 py-2 text-xs text-left transition-colors ${
                    c.id === city.id ? 'font-semibold text-foreground bg-muted' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top-right action stack */}
      <div className="absolute top-4 right-4 z-[1001] flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
        <button onClick={() => navigate('/localnetwork/request')}
          className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5">
          <FileUp size={11} /> request a job
        </button>
        {session ? (
          <button onClick={() => navigate('/localnetwork/dashboard')}
            className="bg-background/90 backdrop-blur-sm border border-border/60 text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full hover:bg-background transition-colors flex items-center gap-1.5">
            <LayoutDashboard size={11} /> dashboard
          </button>
        ) : (
          <button onClick={() => navigate('/localnetwork/auth')}
            className="bg-background/90 backdrop-blur-sm border border-border/60 text-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full hover:bg-background transition-colors flex items-center gap-1.5">
            <Plus size={11} /> join as maker
          </button>
        )}
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/localnetwork/dashboard?demo=1')}
            className="flex-1 bg-background/70 backdrop-blur-sm border border-dashed border-border/60 text-muted-foreground text-[9px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-full hover:text-foreground hover:border-foreground/40 transition-colors">
            maker demo
          </button>
          <button onClick={() => navigate('/localnetwork/requester?demo=1')}
            className="flex-1 bg-background/70 backdrop-blur-sm border border-dashed border-border/60 text-muted-foreground text-[9px] font-bold uppercase tracking-widest px-2 py-1.5 rounded-full hover:text-foreground hover:border-foreground/40 transition-colors">
            requester demo
          </button>
        </div>
      </div>

      {/* Left filter + list panel */}
      {filterPanelOpen ? (
        <div className="absolute top-20 left-4 bottom-4 z-[1000] w-[300px] flex flex-col bg-background/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-4 pt-3.5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">filter</p>
              <button onClick={() => setFilterPanelOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={13} />
              </button>
            </div>
            {/* ZIP search */}
            <div className="mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <MapPin size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={zipInput}
                    onChange={e => { setZipInput(e.target.value); setZipError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') applyZip(); }}
                    placeholder={`zip in ${city.name.toLowerCase()}`}
                    className="w-full h-7 pl-6 pr-2 text-[11px] rounded-full border border-border/60 bg-muted/40 focus:bg-background focus:border-foreground/30 focus:outline-none transition-colors lowercase"
                  />
                </div>
                <button onClick={applyZip} className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0">
                  <Search size={11} />
                </button>
                {activeZip && (
                  <button onClick={clearZip} className="h-7 w-7 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center flex-shrink-0">
                    <X size={11} />
                  </button>
                )}
              </div>
              {zipError && <p className="text-[10px] text-destructive mt-1 lowercase">{zipError}</p>}
              {activeZip && !zipError && <p className="text-[10px] text-muted-foreground mt-1 lowercase">filtering to zip {activeZip}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Toggle on={availableNow} onClick={() => setAvailableNow(v => !v)}>available now</Toggle>
              <Toggle on={sameDayOnly} onClick={() => setSameDayOnly(v => !v)}>same-day capable</Toggle>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {loading ? (
              <p className="text-[11px] text-muted-foreground text-center py-8 lowercase">loading nodes…</p>
            ) : filtered.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-8 lowercase">no makers match your filters</p>
            ) : (
              filtered.map(m => (
                <MakerCard key={m.id} maker={m} selected={selected?.id === m.id} onSelect={() => selectMaker(m)} />
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-border/60 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/70 flex items-center justify-between">
            <span>{filtered.length} node{filtered.length === 1 ? '' : 's'}</span>
            <span>{city.name.toLowerCase()}</span>
          </div>
        </div>
      ) : (
        <button onClick={() => setFilterPanelOpen(true)}
          className="absolute top-20 left-4 z-[1000] bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-background transition-colors flex items-center gap-1.5 shadow-sm">
          <Filter size={11} /> show makers
        </button>
      )}

      <MakerDrawer
        maker={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRequest={() => navigate(`/localnetwork/request?maker=${selected?.id ?? ''}`)}
      />

      {popover && (
        <MakerCardPopover
          maker={popover.maker}
          x={popover.x}
          y={popover.y}
          onClose={() => setPopover(null)}
          onTagClick={(c) => toggleCap(c)}
          onMoreInfo={() => { setSelected(popover.maker); setDrawerOpen(true); setPopover(null); }}
          selectedCaps={activeCaps}
        />
      )}

      <Toaster />
    </div>
  );
}

function Toggle({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all lowercase ${
        on ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
           : 'bg-muted text-foreground/65 border-transparent hover:border-foreground/20'
      }`}>
      {children}
    </button>
  );
}

function normalize(r: any): MakerProfile {
  return {
    id: r.id, user_id: r.user_id, alias: r.alias, city: r.city, zip: r.zip ?? null,
    approx_lat: Number(r.approx_lat), approx_lng: Number(r.approx_lng),
    service_radius_km: Number(r.service_radius_km),
    printer_type: r.printer_type, machine_model: r.machine_model,
    build_volume: r.build_volume,
    materials: Array.isArray(r.materials) ? r.materials : [],
    resolution: r.resolution, max_job_size: r.max_job_size,
    turnaround: r.turnaround,
    availability: r.availability,
    fulfillment: Array.isArray(r.fulfillment) ? r.fulfillment : [],
    price_guidance: r.price_guidance,
    portfolio_urls: Array.isArray(r.portfolio_urls) ? r.portfolio_urls : [],
    bio: r.bio, approved: !!r.approved, verified: !!r.verified,
    machines: Array.isArray(r.machines) ? r.machines : [],
    capabilities: Array.isArray(r.capabilities) ? r.capabilities : [],
    traits: Array.isArray(r.traits) ? r.traits : [],
  };
}