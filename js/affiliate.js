// =====================================================
// affiliate.js — Supabase Affiliate System
// =====================================================
const COMMISSION_RATE = 0.30;
const MIN_WITHDRAW = 50;

// ── Generate affiliate code ───────────────────────
async function generateAffiliateCode(userId) {
  const { data: profile } = await sb.from('profiles').select('name').eq('id', userId).single();
  if (!profile) return null;

  const prefix = (profile.name||'USER').replace(/[^a-zA-Z]/g,'').toUpperCase().slice(0,4);
  const suffix = Math.random().toString(36).substring(2,6).toUpperCase();
  const code = prefix + suffix;

  await sb.from('profiles').update({
    affiliate_code: code, affiliate_enabled: true, updated_at: new Date().toISOString()
  }).eq('id', userId);

  return code;
}

// ── Get affiliate stats ───────────────────────────
async function getAffiliateStats(userId) {
  const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
  const { data: earnings } = await sb.from('affiliate_earnings')
    .select('*').eq('affiliate_id', userId).order('created_at', { ascending: false }).limit(20);

  const { data: referrals } = await sb.from('profiles').select('id, plan').eq('referred_by', userId);
  const activeReferrals = (referrals||[]).filter(u => u.plan && u.plan !== 'free');

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const { count: clicksThisMonth } = await sb.from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_id', userId)
    .gte('clicked_at', monthStart.toISOString());

  const { count: totalClicks } = await sb.from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_id', userId);

  const pending = (earnings||[]).filter(e=>e.status==='pending').reduce((s,e)=>s+parseFloat(e.amount),0);

  return {
    code: profile?.affiliate_code || null,
    enabled: profile?.affiliate_enabled || false,
    balance: parseFloat(profile?.affiliate_balance || 0),
    totalEarned: parseFloat(profile?.affiliate_total_earned || 0),
    pendingEarnings: pending,
    totalReferrals: (referrals||[]).length,
    activeReferrals: activeReferrals.length,
    clicksThisMonth: clicksThisMonth || 0,
    totalClicks: totalClicks || 0,
    earnings: earnings || [],
    referralLink: `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/,'/')}/index.html?ref=${profile?.affiliate_code||''}`
  };
}

// ── Track affiliate click ─────────────────────────
async function trackAffiliateClick(code) {
  if (!code) return;
  localStorage.setItem('pgp_ref', JSON.stringify({ code, at: new Date().toISOString() }));

  const { data: aff } = await sb.from('profiles')
    .select('id').eq('affiliate_code', code).single();
  if (!aff) return;

  await sb.from('affiliate_clicks').insert({
    affiliate_id: aff.id, code
  });
}

// ── Process commission ────────────────────────────
async function processAffiliateCommission(newUserId, amount) {
  const ref = JSON.parse(localStorage.getItem('pgp_ref') || 'null');
  if (!ref || !ref.code) return;
  if (new Date(ref.at) < new Date(Date.now() - 30*864e5)) {
    localStorage.removeItem('pgp_ref'); return;
  }

  const { data: aff } = await sb.from('profiles')
    .select('id, affiliate_balance, affiliate_total_earned')
    .eq('affiliate_code', ref.code).single();
  if (!aff || aff.id === newUserId) return;

  const commission = Math.round(amount * COMMISSION_RATE * 100) / 100;

  await sb.from('affiliate_earnings').insert({
    affiliate_id: aff.id, referred_user_id: newUserId,
    amount: commission, commission_rate: COMMISSION_RATE, status: 'approved'
  });

  await sb.from('profiles').update({
    affiliate_balance: parseFloat(aff.affiliate_balance || 0) + commission,
    affiliate_total_earned: parseFloat(aff.affiliate_total_earned || 0) + commission,
    updated_at: new Date().toISOString()
  }).eq('id', aff.id);

  await sb.from('profiles').update({ referred_by: aff.id }).eq('id', newUserId);
  localStorage.removeItem('pgp_ref');
}

// ── Request withdrawal ────────────────────────────
async function requestWithdrawal(userId, amount, bankDetails) {
  const { data: profile } = await sb.from('profiles').select('affiliate_balance').eq('id', userId).single();
  const balance = parseFloat(profile?.affiliate_balance || 0);
  if (balance < MIN_WITHDRAW) return { success:false, message:`Minimum RM${MIN_WITHDRAW}. Baki: RM${balance.toFixed(2)}` };
  if (amount > balance) return { success:false, message:'Jumlah melebihi baki.' };

  const { error } = await sb.from('withdrawals').insert({
    user_id: userId, amount,
    bank_name: bankDetails.bankName, account_number: bankDetails.accountNumber,
    account_name: bankDetails.accountName
  });
  if (error) return { success:false, message: error.message };

  await sb.from('profiles').update({
    affiliate_balance: balance - amount
  }).eq('id', userId);

  return { success:true };
}

// ── Get withdrawals ───────────────────────────────
async function getWithdrawals(userId) {
  const { data } = await sb.from('withdrawals')
    .select('*').eq('user_id', userId).order('requested_at', { ascending: false });
  return data || [];
}

// ── Check ref param on load ───────────────────────
(function checkRefParam() {
  const url = new URLSearchParams(window.location.search);
  const ref = url.get('ref');
  if (ref) trackAffiliateClick(ref);
})();
