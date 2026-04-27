// =====================================================
// supabase-config.js — Supabase client initialization
// =====================================================

const SUPABASE_URL  = 'https://ddwdwbhcnonbhmlipuvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_REOH4QcENBCviLSQJg3Tdg_N98y5CG7';

// Gunakan window.sb untuk mengelakkan konflik dengan global 'supabase'
if (!window.sb) {
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Global variable untuk digunakan dalam skrip lain
var sb = window.sb;
