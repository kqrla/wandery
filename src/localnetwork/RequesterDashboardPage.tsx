import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/localnetwork/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ArrowLeft, LogOut, Plus, Clock, FileUp } from 'lucide-react';
import type { FabRequest } from '@/localnetwork/data/types';
import { DEMO_REQUESTER_HISTORY } from '@/localnetwork/data/demo';

export default function RequesterDashboardPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const demo = params.get('demo') === '1';
  const { session, loading } = useSession();
  const [requests, setRequests] = useState<FabRequest[]>([]);

  useEffect(() => {
    if (demo) { setRequests(DEMO_REQUESTER_HISTORY); return; }
    if (!session) return;
    supabase.from('fab_requests').select('*').eq('requester_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRequests((data ?? []) as any));
  }, [session, demo]);

  async function signOut() {
    if (demo) { navigate('/localnetwork'); return; }
    await supabase.auth.signOut();
    navigate('/localnetwork');
  }

  if (!demo && loading) return null;
  if (!demo && !session) {
    return (
      <Center>
        <p className="text-sm text-muted-foreground lowercase mb-3">accounts are optional — sign in to track repeat requests, or just submit anonymously.</p>
        <div className="flex gap-2">
          <Link to="/localnetwork/auth"><Button>create account</Button></Link>
          <Link to="/localnetwork/requester?demo=1"><Button variant="outline">try demo</Button></Link>
          <Link to="/localnetwork/request"><Button variant="ghost">submit anonymously</Button></Link>
        </div>
      </Center>
    );
  }

  const open = requests.filter(r => r.status === 'open');
  const inProgress = requests.filter(r => r.status === 'in_progress' || r.status === 'matched');
  const completed = requests.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="px-6 py-4 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link to="/localnetwork" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> back to map
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">localnetwork / requester{demo ? ' / demo' : ''}</span>
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <LogOut size={11} /> {demo ? 'exit demo' : 'sign out'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-20">
        {demo && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[11px] text-amber-800 dark:text-amber-300 lowercase flex items-center justify-between">
            <span>demo mode — nothing you do here is saved.</span>
            <Link to="/localnetwork/auth" className="font-bold underline">sign up for real</Link>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground lowercase">your requests</h1>
            <p className="text-xs text-muted-foreground mt-0.5 lowercase">track jobs you've submitted. accounts are optional — they just save you typing.</p>
          </div>
          <Link to="/localnetwork/request">
            <Button size="sm" className="text-[10px] uppercase tracking-widest font-bold">
              <Plus size={11} className="mr-1" /> new request
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-7">
          <Stat label="open" value={open.length} />
          <Stat label="in progress" value={inProgress.length} />
          <Stat label="completed" value={completed.length} />
        </div>

        <Section title="open" empty="no open requests yet.">
          {open.map(r => <RequestRow key={r.id} r={r} />)}
        </Section>
        <Section title="in progress" empty="nothing in progress.">
          {inProgress.map(r => <RequestRow key={r.id} r={r} />)}
        </Section>
        <Section title="completed" empty="no completed jobs yet.">
          {completed.map(r => <RequestRow key={r.id} r={r} />)}
        </Section>

        <div className="mt-8 rounded-xl border border-border/60 bg-muted/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">about your account</p>
          <p className="text-xs text-muted-foreground lowercase leading-relaxed">
            requesters don't need accounts to submit a job. signing up just lets you re-use your contact info and track jobs over time. your email is shared only with the matched maker.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children.flat() : [children];
  const hasItems = arr.some(Boolean) && arr.length > 0;
  return (
    <section className="mt-6">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
      {hasItems ? <div className="space-y-2">{children}</div> : (
        <p className="text-xs text-muted-foreground lowercase py-5 text-center border border-dashed border-border/60 rounded-xl">{empty}</p>
      )}
    </section>
  );
}

function RequestRow({ r }: { r: FabRequest }) {
  const statusCls = r.status === 'completed'
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
    : r.status === 'in_progress' || r.status === 'matched'
    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
    : 'bg-muted text-muted-foreground';
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3.5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground lowercase truncate">{r.title}</h3>
          <span className="text-[9px] font-mono uppercase text-muted-foreground">{r.job_type}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${statusCls}`}>{r.status.replace('_',' ')}</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted-foreground lowercase">
          <span>qty {r.quantity}</span>
          {r.material && <span>{r.material}</span>}
          <span className="flex items-center gap-1"><Clock size={10} />{r.urgency}</span>
          {r.budget_range && <span>{r.budget_range}</span>}
          {r.file_urls?.length > 0 && <span className="flex items-center gap-1"><FileUp size={10} />{r.file_urls[0]}</span>}
        </div>
      </div>
      <Button size="sm" variant="outline" className="text-[10px] uppercase tracking-widest font-bold">view</Button>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">{children}</div>;
}
