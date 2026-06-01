import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitLocationSuggestion } from '@/lib/api';
import { toast } from 'sonner';
import type { Location } from '@/lib/api';

const ALL_CAPABILITIES = [
  '3D Printing', 'Resin Printing', 'Laser Cutting', 'CNC',
  'PCB', 'Vinyl Cutting / Cricut', 'Electronics', 'Woodworking', 'Sewing',
];

const toHashtag = (cap: string) => '#' + cap.toLowerCase().replace(/[^a-z0-9]/g, '');

interface Props {
  location: Location;
  city: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function LocationEditForm({ location, city, onCancel, onSuccess }: Props) {
  const [capabilities, setCapabilities] = useState<Set<string>>(new Set(location.capabilities));
  const [membershipCost, setMembershipCost] = useState(location.membershipCost);
  const [notes, setNotes] = useState(location.notes);
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggleCapability(cap: string) {
    setCapabilities(prev => {
      const next = new Set(prev);
      next.has(cap) ? next.delete(cap) : next.add(cap);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceUrl.trim()) return;
    setSubmitting(true);

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const newCaps = [...capabilities].sort();
    const oldCaps = [...location.capabilities].sort();
    if (JSON.stringify(newCaps) !== JSON.stringify(oldCaps))
      changes.capabilities = { from: oldCaps, to: newCaps };
    if (membershipCost !== location.membershipCost)
      changes.membershipCost = { from: location.membershipCost, to: membershipCost };
    if (notes !== location.notes)
      changes.notes = { from: location.notes, to: notes };

    const changedFieldCount = Object.keys(changes).length;

    try {
      await submitLocationSuggestion({
        locationName: location.name,
        suggestedChange: changedFieldCount > 0
          ? `Edit to existing listing (${changedFieldCount} field(s) updated)`
          : 'No changes detected, submitting for review',
        sourceUrl,
        notes: JSON.stringify({ type: 'edit', locationId: location.id, changes }),
        city,
        submitterEmail: submitterEmail.trim() || undefined,
        submissionType: 'edit',
      });
      toast('Your edits have been submitted for review.');
      onSuccess();
    } catch {
      toast('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-6 py-4">
      <div className="bg-muted/50 rounded-xl p-3 text-[11px] text-muted-foreground leading-relaxed">
        Edits go into a manual review queue before going live. Please link to an official source below.
      </div>

      {/* Capabilities */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Equipment available</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CAPABILITIES.map(cap => {
            const active = capabilities.has(cap);
            return (
              <button type="button" key={cap} onClick={() => toggleCapability(cap)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                  active
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted text-foreground/60 border-transparent hover:border-foreground/20'
                }`}>
                {toHashtag(cap)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Membership */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access & Membership</Label>
        <Input value={membershipCost} onChange={e => setMembershipCost(e.target.value)}
          placeholder="e.g. Free with library card, $50/month..." />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">About this place</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Hours, booking info, tips for visitors..." />
      </div>

      {/* Source URL */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Source URL <span className="text-destructive">*</span>
        </Label>
        <Input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
          placeholder="https://official-website.com/page" required />
        <p className="text-[10px] text-muted-foreground">Where are you getting this info? Link to official page or announcement.</p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Your email <span className="font-normal normal-case tracking-normal text-muted-foreground/60">(optional)</span>
        </Label>
        <Input
          type="email"
          value={submitterEmail}
          onChange={e => setSubmitterEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <p className="text-[10px] text-muted-foreground">We'll send a confirmation when we receive your edit. Nothing else.</p>
      </div>

      <div className="flex gap-2 pb-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={submitting || !sourceUrl.trim()} className="flex-1">
          {submitting ? 'Submitting...' : 'Submit for review'}
        </Button>
      </div>
    </form>
  );
}
