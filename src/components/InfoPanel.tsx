import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GraduationCap } from 'lucide-react';
import { UNIVERSITIES } from '@/data/universities';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuggest: () => void;
  currentCity: string;
  uniModeEnabled: boolean;
  selectedUniversityId: string;
  onUniModeChange: (enabled: boolean) => void;
  onUniversityChange: (universityId: string) => void;
}

function PinDot({ colorVar }: { colorVar: string }) {
  return (
    <span
      className="w-3 h-3 rounded-full flex-shrink-0 inline-block"
      style={{ background: `hsl(var(${colorVar}))` }}
    />
  );
}

export default function InfoPanel({
  open, onClose, onSuggest, currentCity,
  uniModeEnabled, selectedUniversityId, onUniModeChange, onUniversityChange,
}: Props) {
  const citySchools = UNIVERSITIES.filter(u => u.city === currentCity);
  const universities = citySchools.filter(u => u.type === 'university');
  const communityColleges = citySchools.filter(u => u.type === 'community-college');

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="left" className="w-64 sm:w-72 flex flex-col gap-6 pt-10 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-black uppercase tracking-tight text-xl">fabnetwork</SheetTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Makerspaces, fab labs & libraries — no accounts, no tracking.
          </p>
        </SheetHeader>

        {/* Pin legend — compact */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pin types</p>
          <div className="space-y-2">
            {[
              { label: 'Library', colorVar: '--lib-color' },
              { label: 'Makerspace', colorVar: '--make-color' },
              { label: 'University fab lab', colorVar: '--uni-color' },
            ].map(({ label, colorVar }) => (
              <div key={label} className="flex items-center gap-2.5">
                <PinDot colorVar={colorVar} />
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student mode */}
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={15} style={{ color: 'hsl(var(--uni-color))' }} />
              <div>
                <p className="text-sm font-semibold leading-none">Student mode</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Show campus fab labs</p>
              </div>
            </div>
            <Switch checked={uniModeEnabled} onCheckedChange={onUniModeChange} />
          </div>

          {uniModeEnabled && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your school</p>
              {citySchools.length > 0 ? (
                <Select value={selectedUniversityId} onValueChange={onUniversityChange}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.length > 0 && (
                      <>
                        <div className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Universities</div>
                        {universities.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.shortName}</SelectItem>
                        ))}
                      </>
                    )}
                    {communityColleges.length > 0 && (
                      <>
                        <div className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Community Colleges</div>
                        {communityColleges.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.shortName}</SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground italic">No schools listed for {currentCity} yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <Button onClick={onSuggest} className="w-full gap-2">
            <Plus size={14} />
            Suggest a place
          </Button>
          <div className="text-center flex items-center justify-center gap-2">
            <a href="/admin/login" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
              admin account
            </a>
            <span className="text-[10px] text-muted-foreground/25">|</span>
            <a href="/contributor/login" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
              contributor account
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
