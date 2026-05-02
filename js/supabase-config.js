// =====================================================
// supabase-config.js — Supabase client initialization
// =====================================================
// NOTE: Keys are anon (read-only). Service role handled backend-only.

const SUPABASE_URL  = 'https://ddwdwbhcnonbhmlipuvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_REOH4QcENBCviLSQJg3Tdg_N98y5CG7';

// Gunakan window.sb untuk mengelakkan konflik dengan global 'supabase'
if (!window.sb) {
  try {
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    throw err;
  }
}

// Global variable untuk digunakan dalam skrip lain
var sb = window.sb;
