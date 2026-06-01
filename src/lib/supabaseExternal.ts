import { createClient } from '@supabase/supabase-js';

// External Supabase project that backs the Fab Network data.
// The publishable (anon) key is safe to ship in client code — RLS protects the tables.
const SUPABASE_URL = 'https://tonfwbqtbqjgvrtlnwqz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_IFSElh989zDG_Q3BYO41BQ_WgzOX0-S';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});