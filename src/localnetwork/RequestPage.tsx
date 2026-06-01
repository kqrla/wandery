import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, Check, Shield, Clock, Truck, MapPin } from 'lucide-react';
import { useSession } from '@/localnetwork/hooks/useSession';
import { NETWORK_CITIES, PRINTER_TYPES, COMMON_MATERIALS, URGENCY } from '@/localnetwork/data/constants';
import type { MakerProfile } from '@/localnetwork/data/types';

function haversine([a1, b1]: [number, number], [a2, b2]: [number, number]) {
  const R = 6371;
  const dLat = (a2 - a1) * Math.PI / 180;
  const dLng = (b2 - b1) * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

export default function RequestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session } = useSession();
  const presetMakerId = params.get('maker');

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [makers, setMakers] = useState<MakerProfile[]>([]);

  const [form, setForm] = useState({
    title: '',
    job_type: 'FDM',
    quantity: 1,
    material: '',
    urgency: 'standard',
    budget_range: '',
    city: NETWORK_CITIES[0].name,
    zip: '',
    description: '',
    notes: '',
    requester_email: '',
    file_name: '',
  });

  useEffect(() => {
    supabase.from('maker_profiles').select('*').eq('approved', true).eq('city', form.city)
      .then(({ data }) => setMakers((data ?? []) as any));
  }, [form.city]);

  const matched = useMemo(() => {
    if (!submittedId) return [];
    const cityCenter = NETWORK_CITIES.find(c => c.name === form.city)!.center;
    return makers
      .filter(m => m.printer_type === form.job_type)
      .filter(m => m.availability !== 'offline')
      .map(m => ({ ...m, _dist: haversine(cityCenter as [number, number], [Number(m.approx_lat), Number(m.approx_lng)]) }))
      .sort((a, b) => {
        const av = a.availability === 'available' ? 0 : 1;
        const bv = b.availability === 'available' ? 0 : 1;
        if (av !== bv) return av - bv;
        return a._dist - b._dist;
      });
  }, [submittedId, makers, form.job_type, form.city]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('add a short title for your job'); return; }
    if (!session && !form.requester_email) { toast.error('add an email so the maker can reach you'); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from('fab_requests').insert({
      requester_id: session?.user.id ?? null,
      requester_email: form.requester_email || session?.user.email || null,
      job_type: form.job_type,
      title: form.title.trim().toLowerCase(),
      description: form.description || null,
      quantity: form.quantity,
      material: form.material || null,
      urgency: form.urgency,
      budget_range: form.budget_range || null,
      city: form.city,
      zip: form.zip || null,
      file_urls: form.file_name ? [form.file_name] : [],
      notes: form.notes || null,
      matched_maker_id: presetMakerId || null,
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmittedId(data.id);
    setStep(2);
    toast.success('request submitted — routing to nearby makers');
  }

  if (step === 2 && submittedId) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster />
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-8 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={14} className="text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground lowercase">request routed</h1>
              <p className="text-xs text-muted-foreground lowercase">{matched.length} nearby maker{matched.length === 1 ? '' : 's'} match your job</p>
            </div>
          </div>

          <div className="space-y-2">
            {matched.length === 0 && (
              <p className="text-sm text-muted-foreground lowercase py-8 text-center">no available makers in {form.city.toLowerCase()} for {form.job_type.toLowerCase()} right now. we'll keep your request open.</p>
            )}
            {matched.map(m => (
              <div key={m.id} className="rounded-xl border border-border/60 bg-card p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-foreground lowercase">{m.alias}</h3>
                    {m.verified && <Shield size={11} className="text-foreground/60" />}
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                      m.availability === 'available' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}>{m.availability}</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5 lowercase">{m.printer_type} · {m.machine_model}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[10px] text-muted-foreground lowercase">
                    {m.turnaround && <span className="flex items-center gap-1"><Clock size={10} />{m.turnaround}</span>}
                    {m.fulfillment.includes('pickup') && <span className="flex items-center gap-1"><MapPin size={10} />pickup</span>}
                    {m.fulfillment.includes('delivery') && <span className="flex items-center gap-1"><Truck size={10} />delivery</span>}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-[10px] uppercase tracking-widest font-bold">notify</Button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground lowercase">request id: <span className="font-mono">{submittedId.slice(0, 8)}</span></p>
            <Button onClick={() => navigate('/localnetwork')} variant="outline" size="sm">back to map</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8 pb-20">
        <h1 className="text-2xl font-bold text-foreground lowercase">submit a fabrication request</h1>
        <p className="text-sm text-muted-foreground mt-1.5 lowercase leading-relaxed">
          describe what you need made. we'll route it to nearby makers with the right machine & availability.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <Field label="short title">
            <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. enclosure for usb hub" />
          </Field>

          <Field label="job type">
            <div className="flex flex-wrap gap-1.5">
              {PRINTER_TYPES.map(t => (
                <button type="button" key={t} onClick={() => update('job_type', t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.job_type === t ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                  }`}>{t}</button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="quantity">
              <Input type="number" min={1} value={form.quantity} onChange={e => update('quantity', Math.max(1, Number(e.target.value)))} />
            </Field>
            <Field label="material preference">
              <select value={form.material} onChange={e => update('material', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">no preference</option>
                {COMMON_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="urgency">
            <div className="flex gap-1.5">
              {URGENCY.map(u => (
                <button type="button" key={u} onClick={() => update('urgency', u)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors lowercase ${
                    form.urgency === u ? 'bg-foreground text-background border-foreground' : 'bg-muted text-foreground/70 border-transparent hover:border-foreground/30'
                  }`}>{u}</button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="budget range (optional)">
              <Input value={form.budget_range} onChange={e => update('budget_range', e.target.value)} placeholder="$20-50" />
            </Field>
            <Field label="pickup zip (optional)">
              <Input value={form.zip} onChange={e => update('zip', e.target.value)} placeholder="94110" />
            </Field>
          </div>

          <Field label="city">
            <select value={form.city} onChange={e => update('city', e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {NETWORK_CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="upload stl / file / reference">
            <label className="block border border-dashed border-border rounded-lg px-4 py-6 text-center cursor-pointer hover:border-foreground/40 transition-colors">
              <input type="file" className="hidden" accept=".stl,.step,.stp,.obj,.svg,.dxf,.png,.jpg,.jpeg,.pdf"
                onChange={e => update('file_name', e.target.files?.[0]?.name ?? '')} />
              <p className="text-xs text-muted-foreground lowercase">
                {form.file_name ? <><span className="text-foreground font-mono">{form.file_name}</span> selected</> : 'click to select a file (stl, step, svg, image)'}
              </p>
            </label>
          </Field>

          <Field label="description">
            <Textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="dimensions, tolerances, finish, anything important." />
          </Field>

          {!session && (
            <Field label="your email (so makers can reach you)">
              <Input type="email" value={form.requester_email} onChange={e => update('requester_email', e.target.value)} placeholder="you@example.com" />
            </Field>
          )}

          <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground lowercase">
              your request stays private. only matched makers can see it.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? '…' : 'route to nearby makers'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="px-6 py-4 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <Link to="/localnetwork" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={12} /> back to map
      </Link>
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">localnetwork / request</span>
    </header>
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