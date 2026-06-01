import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Plus } from 'lucide-react';
import { submitLocationSuggestion } from '@/lib/api';
import { CITIES } from '@/data/cities';
import { toast } from 'sonner';

const CAPABILITIES = [
  '3D Printing', 'Resin Printing', 'Laser Cutting', 'CNC',
  'PCB', 'Vinyl Cutting / Cricut', 'Electronics', 'Woodworking', 'Sewing',
];

const LOCATION_TYPES = [
  'Library', 'Makerspace', 'University Fab Lab',
  'Community Space', 'Hackerspace', 'Other',
];

interface Props {
  open: boolean;
  onClose: () => void;
  city: string;
}

// ── Equipment multi-select with custom tags ──────────────────────────────────
function EquipmentPicker({ selected, custom, onToggle, onAdd, onRemove }: {
  selected: Set<string>;
  custom: string[];
  onToggle: (cap: string) => void;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [input, setInput] = useState('');

  function commit() {
    const tag = input.trim();
    if (tag && !selected.has(tag) && !custom.includes(tag)) { onAdd(tag); }
    setInput('');
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {CAPABILITIES.map(cap => (
          <button key={cap} type="button" onClick={() => onToggle(cap)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
              selected.has(cap)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-transparent hover:border-border'
            }`}>
            {cap}
          </button>
        ))}
        {custom.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-accent/40 text-foreground border border-accent/60">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-destructive transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          placeholder="Add your own tag…" className="h-8 text-xs" />
        <Button type="button" variant="outline" size="sm" onClick={commit} className="h-8 px-2.5">
          <Plus size={13} />
        </Button>
      </div>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function SuggestModal({ open, onClose, city }: Props) {
  const [selectedCity, setSelectedCity] = useState(city);
  const [locationType, setLocationType] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [forStudents, setForStudents] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [costAmount, setCostAmount] = useState('0');
  const [costNote, setCostNote] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [loading, setLoading] = useState(false);

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) setSelectedCity(city);
    if (!isOpen) onClose();
  }

  function reset() {
    setLocationType(''); setLocationName(''); setAddress('');
    setForStudents(false); setSelectedEquipment(new Set()); setCustomTags([]);
    setCostAmount('0'); setCostNote(''); setDescription('');
    setSourceUrl(''); setSubmitterEmail('');
  }

  function toggleEquipment(cap: string) {
    setSelectedEquipment(prev => {
      const next = new Set(prev);
      next.has(cap) ? next.delete(cap) : next.add(cap);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationName || !locationType || !selectedCity || costAmount === '') return;
    setLoading(true);

    const allEquipment = [...selectedEquipment, ...customTags];
    const costNum = Number(costAmount);
    const costStr = costNum === 0 ? 'Free' : `$${costAmount}`;
    const costFull = costNote ? `${costStr} (${costNote})` : costStr;

    const notes = [
      `Type: ${locationType}`,
      `For university students: ${forStudents ? 'Yes' : 'No'}`,
      allEquipment.length > 0 ? `Equipment: ${allEquipment.join(', ')}` : null,
      `Cost: ${costFull}`,
    ].filter(Boolean).join('\n');

    try {
      await submitLocationSuggestion({
        locationName,
        suggestedChange: description || '(see structured notes)',
        sourceUrl: sourceUrl || '',
        notes,
        city: selectedCity,
        address,
        submitterEmail,
        submissionType: 'suggestion',
      });
      toast('Thanks! Your submission has been received.');
      reset();
      onClose();
    } catch {
      toast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const knownCityNames = CITIES.map(c => c.name);
  const canSubmit = !!locationName && !!locationType && !!selectedCity && costAmount !== '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest a place</DialogTitle>
          <DialogDescription>
            Know a makerspace, library, or fab space? Submissions are reviewed before being added.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* City */}
          <div className="space-y-1.5">
            <Label>City *</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger>
              <SelectContent>
                {knownCityNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                {city && !knownCityNames.includes(city) && <SelectItem value={city}>{city}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger><SelectValue placeholder="What kind of space is this?" /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-name">Location name *</Label>
            <Input id="sug-name" value={locationName} onChange={e => setLocationName(e.target.value)}
              placeholder="e.g. Noisebridge" required />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-addr">Address <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="sug-addr" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 2169 Mission St" />
          </div>

          {/* University students toggle */}
          <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2.5">
            <div>
              <p className="text-sm font-medium leading-none">Accessible to university students?</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">e.g. student ID required, discounted access</p>
            </div>
            <Switch checked={forStudents} onCheckedChange={setForStudents} />
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <Label>Equipment provided <span className="text-muted-foreground">(optional)</span></Label>
            <EquipmentPicker
              selected={selectedEquipment}
              custom={customTags}
              onToggle={toggleEquipment}
              onAdd={tag => setCustomTags(prev => [...prev, tag])}
              onRemove={tag => setCustomTags(prev => prev.filter(t => t !== tag))}
            />
          </div>

          {/* Cost */}
          <div className="space-y-1.5">
            <Label>Access cost *</Label>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 border border-border rounded-md px-3 h-9 bg-background w-28 flex-shrink-0">
                <span className="text-sm text-muted-foreground">$</span>
                <input type="number" min="0" step="any" value={costAmount}
                  onChange={e => setCostAmount(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none"
                  placeholder="0" required />
              </div>
              <Input value={costNote} onChange={e => setCostNote(e.target.value)}
                placeholder="e.g. with library card" className="flex-1" />
            </div>
            <p className="text-[11px] text-muted-foreground">$0 = free. Use the note for conditions like "per month" or "with membership".</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="sug-desc" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Hours, access policies, general vibe…" rows={2} />
          </div>

          {/* Source URL */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-url">Source URL <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="sug-url" type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://…" />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="sug-email">Your email <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="sug-email" type="email" value={submitterEmail}
              onChange={e => setSubmitterEmail(e.target.value)} placeholder="you@example.com" />
            <p className="text-[11px] text-muted-foreground">Quick confirmation only. Nothing else, ever.</p>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !canSubmit}>
              {loading ? 'Sending…' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
