import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Helps debug bad env wiring in dev
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anon);

// Name of your bucket in Storage (create one called "proposals" or change this)
export const BUCKET = 'proposals';