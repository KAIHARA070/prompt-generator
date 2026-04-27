// =====================================================
// supabase-config.js — Supabase client initialization
// =====================================================

const SUPABASE_URL  = 'https://ddwdwbhcnonbhmlipuvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_REOH4QcENBCviLSQJg3Tdg_N98y5CG7';

// Gunakan supabaseClient untuk mengelakkan konflik dengan library global 'supabase'
if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Shortcut global untuk digunakan dalam skrip lain
const supabase = window.supabaseClient;
