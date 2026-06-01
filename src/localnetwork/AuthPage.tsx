import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error('email and password (6+ chars) required');
      return;
    }
    setLoading(true);
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + '/localnetwork/dashboard' },
      });
      if (error) toast.error(error.message);
      else { toast.success('account created — you can set up your maker profile now'); navigate('/localnetwork/join'); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else navigate('/localnetwork/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/60">
        <Link to="/localnetwork" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={12} /> back to map
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">localnetwork</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground lowercase">
            {mode === 'signup' ? 'join the network' : 'sign in'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 lowercase leading-relaxed">
            {mode === 'signup'
              ? 'create an account to list your machine. profiles are reviewed before going live.'
              : 'access your maker dashboard and incoming requests.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" autoComplete="email" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? '...' : mode === 'signup' ? 'create account' : 'sign in'}
            </Button>
          </form>

          <button
            onClick={() => setMode(m => (m === 'signup' ? 'signin' : 'signup'))}
            className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors lowercase"
          >
            {mode === 'signup' ? 'already have an account? sign in' : 'new here? create an account'}
          </button>
        </div>
      </div>
    </div>
  );
}