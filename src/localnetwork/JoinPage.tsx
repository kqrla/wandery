import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/localnetwork/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  PRINTER_TYPES, COMMON_MATERIALS, FULFILLMENT_OPTIONS, AVAILABILITY,
  NETWORK_CITIES, FAB_CAPABILITIES, MAKER_TRAITS, toHashtag,
} from '@/localnetwork/data/constants';
import type { MakerMachine } from '@/localnetwork/data/types';

function newMachine(): MakerMachine {
  return {
    id: crypto.randomUUID(),
    printer_type: 'FDM',
    machine_model: '',
    build_volume: '',
    resolution: '',
    max_job_size: '',
    materials: [],
    supplies: '',
    notes: '',
  };
}

export default function JoinPage() {
  const navigate = useNavigate();
  const { session, loading: sessLoading } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [zipError, setZipError] = useState('');

  const [form, setForm] = useState({
    alias: '',
    city: NETWORK_CITIES[0].name,
    zip: '',
    service_radius_km: 10,
    machines: [newMachine()] as MakerMachine[],
    capabilities: [] as string[],
    traits: [] as string[],
    turnaround: '',
    availability: 'available' as (typeof AVAILABILITY)[number],
    fulfillment: ['pickup'] as string[],
    price_guidance: '',
    bio: '',
  });

  useEffect(() => {
    if (!session) return;
    supabase.from('maker_profiles').select('*').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          const existingMachines = Array.isArray(data.machines) && (data.machines as any[]).length > 0
            ? (data.machines as unknown as MakerMachine[])
            : [{
                id: crypto.randomUUID(),
                printer_type: data.printer_type || 'FDM',
                machine_model: data.machine_model ?? '',
                build_volume: data.build_volume ?? '',
                resolution: data.resolution ?? '',
                max_job_size: data.max_job_size ?? '',
                materials: Array.isArray(data.materials) ? (data.materials as string[]) : [],
                supplies: '',
                notes: '',
              }];
          setForm({
            alias: data.alias,
            city: data.city,
            zip: (data as any).zip ?? '',
            service_radius_km: data.service_radius_km,
            machines: existingMachines,
            capabilities: Array.isArray((data as any).capabilities) ? ((data as any).capabilities as string[]) : [],
            traits: Array.isArray((data as any).traits) ? ((data as any).traits as string[]) : [],
            turnaround: data.turnaround ?? '',
            availability: data.availability as any,
            fulfillment: Array.isArray(data.fulfillment) ? (data.fulfillment as string[]) : [],
            price_guidance: data.price_guidance ?? '',
            bio: data.bio ?? '',
          });
        }
      });
  }, [session]);

  if (sessLoading) return null;
  if (!session) {
    return (
      <Center>
        <p className="text-sm text-muted-foreground lowercase mb-3">you need an account to list your machines.</p>
        <Link to="/localnetwork/auth"><Button>create account</Button></Link>
      </Center>
    );
  }

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function toggleArray(field: 'fulfillment' | 'capabilities' | 'traits', val: string) {
    setForm(f => {
      const arr = f[field] as string[];
      return { ...f, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }

  function updateMachine(idx: number, patch: Partial<MakerMachine>) {
    setForm(f => ({
      ...f,
      machines: f.machines.map((m, i) => i === idx ? { ...m, ...patch } : m),
    }));
  }

  function toggleMachineMaterial(idx: number, mat: string) {
    setForm(f => ({
      ...f,
      machines: f.machines.map((m, i) => {
        if (i !== idx) return m;
        const has = m.materials.includes(mat);
        return { ...m, materials: has ? m.materials.filter(x => x !== mat) : [...m.materials, mat] };
      }),
    }));
  }

  function addMachine() {
    setForm(f => ({ ...f, machines: [...f.machines, newMachine()] }));
  }

  function removeMachine(idx: number) {
    setForm(f => ({
      ...f,
      machines: f.machines.length === 1 ? f.machines : f.machines.filter((_, i) => i !== idx),
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setZipError('');
    if (!form.alias.trim()) { toast.error('alias is required'); return; }
    if (form.machines.length === 0) { toast.error('add at least one machine'); return; }
    if (form.machines.some(m => !m.printer_type)) { toast.error('every machine needs a type'); return; }

    const cityCfg = NETWORK_CITIES.find(c => c.name === form.city)!;
    let lat = cityCfg.center[0];
    let lng = cityCfg.center[1];
    const zip = form.zip.trim();
    if (zip) {
      const coords = cityCfg.zips[zip];
      if (!coords) {
        setZipError(`not a valid zip for ${form.city.toLowerCase()}`);
        toast.error('invalid zip for selected city');
        return;
      }
      [lat, lng] = coords;
    }

    setSubmitting(true);
    const primary = form.machines[0];
    const allMaterials = Array.from(new Set(form.machines.flatMap(m => m.materials)));

    const payload: any = {
      user_id: session!.user.id,
      alias: form.alias.trim().toLowerCase(),
      city: form.city,
      zip: zip || null,
      approx_lat: lat,
      approx_lng: lng,
      service_radius_km: form.service_radius_km,
      // primary/denormalized fields (back-compat)
      printer_type: primary.printer_type,
      machine_model: primary.machine_model || null,
      build_volume: primary.build_volume || null,
      materials: allMaterials,
      resolution: primary.resolution || null,
      max_job_size: primary.max_job_size || null,
      // full machine list
      machines: form.machines,
      capabilities: form.capabilities,
      traits: form.traits,
      turnaround: form.turnaround || null,
      availability: form.availability,
      fulfillment: form.fulfillment,
      price_guidance: form.price_guidance || null,
      bio: form.bio || null,
    };
    const { error } = existingId
      ? await supabase.from('maker_profiles').update(payload).eq('id', existingId)
      : await supabase.from('maker_profiles').insert(payload);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(existingId ? 'profile updated — pending review for changes' : 'profile submitted — pending manual review');
    navigate('/localnetwork/dashboard');
  }

  const cityCfg = NETWORK_CITIES.find(c => c.name === form.city)!;
  const zipOptions = Object.keys(cityCfg.zips).sort();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="px-6 py-4 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link to="/localnetwork" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> back to map
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">localnetwork / join</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 pb-20">
        <h1 className="text-2xl font-bold text-foreground lowercase">{existingId ? 'edit your maker profile' : 'list your machines'}</h1>
        <p className="text-sm text-muted-foreground mt-1.5 lowercase leading-relaxed">
          your profile is private until manually reviewed. exact addresses are never shown — only your zip area and service radius.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-7">
          <Section title="identity">
            <Field label="alias / display name">
              <Input value={form.alias} onChange={e => update('alias', e.target.value)} placeholder="e.g. mission_maker" />
            </Field>
            <Field label="bio">
              <Textarea rows={2} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="one line about your shop." />
            </Field>
          </Section>

          <Section title="location">
            <div className="grid grid-cols-2 gap-3">
              <Field label="city">
                <select value={form.city} onChange={e => { update('city', e.target.value); update('zip', ''); setZipError(''); }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {NETWORK_CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="zip code">
                <div className="relative">
                  <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    list={`zips-${cityCfg.id}`}
                    value={form.zip}
                    onChange={e => { update('zip', e.target.value); setZipError(''); }}
                    placeholder="e.g. 94110"
                    className="w-full h-10 pl-8 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <datalist id={`zips-${cityCfg.id}`}>
                    {zipOptions.map(z => <option key={z} value={z} />)}
                  </datalist>
                </div>
                {zipError && <p className="text-[10px] text-destructive mt-1 lowercase">{zipError}</p>}
              </Field>
            </div>
            <Field label={`service radius — ${form.service_radius_km} km`}>
              <input type="range" min={2} max={40} value={form.service_radius_km}
                onChange={e => update('service_radius_km', Number(e.target.value))}
                className="w-full accent-foreground" />
            </Field>
          </Section>

          <Section
            title={`machines (${form.machines.length})`}
            action={
              <button type="button" onClick={addMachine}
                className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground flex items-center gap-1">
                <Plus size={11} /> add machine
              </button>
            }
          >
            <p className="text-[11px] text-muted-foreground lowercase -mt-1">
              list every printer / cutter / cnc you own. include resin printers, vinyl cutters (cricut), laser cutters, cnc routers, etc.
            </p>
            <div className="space-y-4">
              {form.machines.map((m, i) => (
                <MachineEditor
                  key={m.id}
                  index={i}
                  machine={m}
                  canRemove={form.machines.length > 1}
                  onUpdate={patch => updateMachine(i, patch)}
                  onToggleMaterial={mat => toggleMachineMaterial(i, mat)}
                  onRemove={() => removeMachine(i)}
                />
              ))}
            </div>
          </Section>

          <Section title="capabilities">
            <p className="text-[11px] text-muted-foreground lowercase -mt-1">
              what kinds of fabrication can you do? these are the same tags used on the main fabnetwork map.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FAB_CAPABILITIES.map(c => {
                const on = form.capabilities.includes(c);
                return (
                  <button type="button" key={c} onClick={() => toggleArray('capabilities', c)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-colors ${
                      on ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                    }`}>
                    {toHashtag(c)}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="traits">
            <p className="text-[11px] text-muted-foreground lowercase -mt-1">
              describe the kind of work you're best at. shown as pills on your profile (not used as filters).
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MAKER_TRAITS.map(t => {
                const on = form.traits.includes(t);
                return (
                  <button type="button" key={t} onClick={() => toggleArray('traits', t)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors lowercase ${
                      on
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                    }`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="logistics">
            <Field label="turnaround">
              <Input value={form.turnaround} onChange={e => update('turnaround', e.target.value)} placeholder="1-3 days, same-day capable, etc." />
            </Field>
            <Field label="availability">
              <div className="flex gap-1.5">
                {AVAILABILITY.map(a => (
                  <button type="button" key={a} onClick={() => update('availability', a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors lowercase ${
                      form.availability === a ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                    }`}>{a}</button>
                ))}
              </div>
            </Field>
            <Field label="fulfillment">
              <div className="flex gap-1.5">
                {FULFILLMENT_OPTIONS.map(f => {
                  const on = form.fulfillment.includes(f);
                  return (
                    <button type="button" key={f} onClick={() => toggleArray('fulfillment', f)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors lowercase ${
                        on ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                      }`}>{f}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="price guidance (optional)">
              <Input value={form.price_guidance} onChange={e => update('price_guidance', e.target.value)} placeholder="$0.15/g, quote per part, etc." />
            </Field>
          </Section>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground lowercase">
              by submitting you agree to fulfill jobs honestly. exact address is never shown.
            </p>
            <Button type="submit" disabled={submitting} className="flex-shrink-0">
              {submitting ? '…' : existingId ? <><Check size={13} className="mr-1" /> save changes</> : 'submit for review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MachineEditor({
  index, machine, canRemove, onUpdate, onToggleMaterial, onRemove,
}: {
  index: number;
  machine: MakerMachine;
  canRemove: boolean;
  onUpdate: (patch: Partial<MakerMachine>) => void;
  onToggleMaterial: (mat: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          machine #{index + 1}
        </p>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 lowercase">
            <Trash2 size={11} /> remove
          </button>
        )}
      </div>

      <Field label="type">
        <div className="flex flex-wrap gap-1.5">
          {PRINTER_TYPES.map(t => (
            <button type="button" key={t} onClick={() => onUpdate({ printer_type: t })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                machine.printer_type === t ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
              }`}>{t}</button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="model">
          <Input value={machine.machine_model ?? ''} onChange={e => onUpdate({ machine_model: e.target.value })}
            placeholder="bambu x1c, cricut maker 3, glowforge…" />
        </Field>
        <Field label="build volume / work area">
          <Input value={machine.build_volume ?? ''} onChange={e => onUpdate({ build_volume: e.target.value })}
            placeholder="256×256×256mm, 12×24in…" />
        </Field>
        <Field label="resolution / nozzle / bit">
          <Input value={machine.resolution ?? ''} onChange={e => onUpdate({ resolution: e.target.value })}
            placeholder="0.4mm, 50µm, 1/8in" />
        </Field>
        <Field label="max job size">
          <Input value={machine.max_job_size ?? ''} onChange={e => onUpdate({ max_job_size: e.target.value })}
            placeholder="up to 250mm" />
        </Field>
      </div>

      <Field label="materials / filaments">
        <div className="flex flex-wrap gap-1.5">
          {COMMON_MATERIALS.map(m => {
            const on = machine.materials.includes(m);
            return (
              <button type="button" key={m} onClick={() => onToggleMaterial(m)}
                className={`text-[10px] font-mono px-2 py-1 rounded-full border transition-colors ${
                  on ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                }`}>{m}</button>
            );
          })}
        </div>
      </Field>

      <Field label="specific supplies on hand (optional)">
        <Textarea
          rows={2}
          value={machine.supplies ?? ''}
          onChange={e => onUpdate({ supplies: e.target.value })}
          placeholder="e.g. 5 spools of black pla, 2kg petg-cf, walnut plywood sheets, htv vinyl rolls (red/black/white), 2mm acrylic"
        />
      </Field>

      <Field label="notes (optional)">
        <Input value={machine.notes ?? ''} onChange={e => onUpdate({ notes: e.target.value })}
          placeholder="dual extruder, enclosed, food-safe-only, etc." />
      </Field>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground lowercase block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">{children}</div>;
}
