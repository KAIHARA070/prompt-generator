// =====================================================
// supabase-config.js — Supabase client initialization
// =====================================================
// NOTE: Keys are anon (read-only). Service role handled backend-only.

// Read dari environment variables (injected by Vercel at build-time)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

if (!window.sb) {
  try {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    throw err;
  }
}

var sb = window.sb;
