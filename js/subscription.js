// =====================================================
// subscription.js — Plan management (Supabase)
// =====================================================

const PLANS = {
  free:    { id:'free',    name:'Percuma', icon:'<i class="fa fa-gift"></i>', price:{monthly:0,yearly:0},    limits:{promptsPerMonth:5,savedPrompts:10,aiCalls:0,teamMembers:1,export:['txt'],watermark:true,analytics:false,affiliate:false,apiAccess:false,whitelabel:false}, features:['5 prompt/bulan','10 prompt tersimpan','Template asas','Eksport .txt','Sokongan komuniti'], missing:['Jana AI sebenar','Eksport PDF/DOCX','Program affiliate','Analytics','API access'], color:'var(--text-muted)', cta:'Mulakan Percuma', badge:null },
  starter: { id:'starter', name:'Starter', icon:'<i class="fa fa-bolt"></i>', price:{monthly:29,yearly:19},   limits:{promptsPerMonth:50,savedPrompts:100,aiCalls:50,teamMembers:1,export:['txt','pdf'],watermark:false,analytics:false,affiliate:true,apiAccess:false,whitelabel:false}, features:['50 prompt/bulan','100 prompt tersimpan','Jana AI sebenar (50x/bln)','Eksport PDF','Program affiliate','Tiada watermark','Sokongan email'], missing:['DOCX export','Analytics','API access','White-label'], color:'#388BFD', cta:'Cuba 7 Hari Percuma', badge:'Popular' },
  pro:     { id:'pro',     name:'Pro',     icon:'<i class="fa fa-fire"></i>', price:{monthly:79,yearly:55},   limits:{promptsPerMonth:300,savedPrompts:1000,aiCalls:300,teamMembers:3,export:['txt','pdf','docx','html'],watermark:false,analytics:true,affiliate:true,apiAccess:false,whitelabel:false}, features:['300 prompt/bulan','1,000 prompt tersimpan','Jana AI sebenar (300x/bln)','Eksport PDF+DOCX+HTML','Analytics lengkap','3 ahli pasukan','Sokongan keutamaan'], missing:['API access','White-label'], color:'var(--accent-light)', cta:'Mulakan Pro', badge:'Best Value' },
  agency:  { id:'agency',  name:'Agency',  icon:'<i class="fa fa-building"></i>', price:{monthly:199,yearly:149}, limits:{promptsPerMonth:-1,savedPrompts:-1,aiCalls:-1,teamMembers:10,export:['txt','pdf','docx','html','all'],watermark:false,analytics:true,affiliate:true,apiAccess:true,whitelabel:true}, features:['Prompt UNLIMITED','Simpan UNLIMITED','Jana AI UNLIMITED','Semua format eksport','10 ahli pasukan','API access','White-label','Dedicated manager'], missing:[], color:'#d2a8ff', cta:'Hubungi Jualan', badge:'Enterprise' }
};
const PLAN_ORDER = ['free','starter','pro','agency'];

// ── Get user plan ─────────────────────────────────
function getUserPlan() {
  const session = getSession();
  if (!session) return PLANS.free;
  return PLANS[session.plan] || PLANS.free;
}

// ── Upgrade plan ──────────────────────────────────
async function upgradePlan(planId, billingCycle='monthly', promoCode='') {
  const session = getSession();
  if (!session) return { success:false, message:'Sila log masuk dahulu.' };
  const plan = PLANS[planId];
  if (!plan) return { success:false, message:'Pelan tidak dijumpai.' };

  const price = billingCycle==='yearly' ? plan.price.yearly*12 : plan.price.monthly;
  const expiryDays = billingCycle==='yearly' ? 365 : 30;

  let discount = 0;
  if (promoCode) {
    const { data: code } = await sb.from('promo_codes')
      .select('*').eq('code', promoCode.toUpperCase()).eq('active', true).single();
    if (code) {
      discount = code.type==='percentage' ? price*(code.value/100) : code.value;
      await sb.from('promo_codes').update({ used_count: (code.used_count||0)+1 }).eq('id', code.id);
    }
  }

  const expiresAt = new Date(Date.now() + expiryDays*864e5).toISOString();

  // Update profile
  const { error: profErr } = await sb.from('profiles').update({
    plan: planId,
    plan_billing_cycle: billingCycle,
    plan_started_at: new Date().toISOString(),
    plan_expires_at: expiresAt,
    ai_credits_left: plan.limits.aiCalls===-1 ? 99999 : plan.limits.aiCalls,
    is_trial: true,
    trial_ends_at: new Date(Date.now()+7*864e5).toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', session.userId);

  if (profErr) return { success:false, message: profErr.message };

  // Insert subscription record
  await sb.from('subscriptions').insert({
    user_id: session.userId, plan: planId, billing_cycle: billingCycle,
    amount: price-discount, discount, promo_code: promoCode||null,
    status: 'active', expires_at: expiresAt, payment_method: 'toyyibpay'
  });

  await cacheSession();
  return { success:true, plan, price:price-discount, discount };
}

// ── Check limits ──────────────────────────────────
async function checkLimit(feature) {
  const plan = getUserPlan();
  const stats = await getUserStats();
  const profile = await getCurrentProfile();

  switch(feature) {
    case 'createPrompt':
      if (plan.limits.promptsPerMonth===-1) return {allowed:true};
      if ((stats.thisMonth||0) >= plan.limits.promptsPerMonth)
        return {allowed:false, reason:`Had bulanan (${plan.limits.promptsPerMonth}) dicapai.`, upgrade:true};
      return {allowed:true, remaining: plan.limits.promptsPerMonth-(stats.thisMonth||0)};

    case 'savePrompt':
      if (plan.limits.savedPrompts===-1) return {allowed:true};
      if ((stats.total||0) >= plan.limits.savedPrompts)
        return {allowed:false, reason:`Had simpanan (${plan.limits.savedPrompts}) dicapai.`, upgrade:true};
      return {allowed:true};

    case 'aiGenerate':
      if (!plan.limits.aiCalls) return {allowed:false, reason:'Naik taraf ke Starter untuk Jana AI.', upgrade:true};
      if ((profile?.ai_credits_left||0) <= 0) return {allowed:false, reason:'Kredit AI habis.', upgrade:true};
      return {allowed:true, remaining: profile?.ai_credits_left||0};

    case 'affiliate':
      if (!plan.limits.affiliate) return {allowed:false, reason:'Naik taraf ke Starter untuk program affiliate.', upgrade:true};
      return {allowed:true};

    default: return {allowed:true};
  }
}

// ── Deduct AI credit ──────────────────────────────
async function deductAICredit(amount=1) {
  const session = getSession();
  if (!session) return;
  const profile = await getCurrentProfile();
  if (profile?.plan === 'agency') return;
  await sb.from('profiles').update({
    ai_credits_left: Math.max(0, (profile?.ai_credits_left||0) - amount)
  }).eq('id', session.userId);
}

// ── Show upgrade modal ────────────────────────────
function showUpgradePrompt(reason='') {
  const plan = getUserPlan();
  const nextPlan = PLAN_ORDER[PLAN_ORDER.indexOf(plan.id)+1] || 'pro';
  const next = PLANS[nextPlan];
  let modal = document.getElementById('upgradeModal');
  if (!modal) {
    modal = document.createElement('div'); modal.id='upgradeModal'; modal.className='modal-overlay';
    modal.innerHTML = `<div class="modal" style="max-width:460px;text-align:center">
      <div class="modal-header"><h3 class="modal-title"><i class="fa fa-rocket"></i> Naik Taraf Pelan</h3><button class="modal-close" onclick="closeModal('upgradeModal')"><i class="fa fa-xmark"></i></button></div>
      <div class="modal-body">
        <div style="font-size:2.5rem;margin-bottom:12px">${next.icon}</div>
        <p id="upgradeReason" style="color:var(--text-secondary);margin-bottom:20px"></p>
        <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:10px;padding:20px;margin-bottom:20px">
          <div style="font-size:1.6rem;font-weight:800;color:${next.color}">RM${next.price.monthly}<span style="font-size:.9rem;color:var(--text-muted)">/bulan</span></div>
          <ul style="list-style:none;text-align:left;font-size:.85rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:6px;margin-top:12px">
            ${next.features.slice(0,4).map(f=>`<li><i class="fa fa-check"></i> ${f}</li>`).join('')}
          </ul>
        </div>
        <a href="pricing.html" class="btn btn-primary btn-block" style="margin-bottom:10px">${next.cta}</a>
        <button class="btn btn-ghost btn-block btn-sm" onclick="closeModal('upgradeModal')">Mungkin lain kali</button>
      </div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('upgradeReason').textContent = reason;
  openModal('upgradeModal');
}

// ── Validate promo code ───────────────────────────
async function validatePromoCode(code) {
  const { data } = await sb.from('promo_codes')
    .select('*').eq('code', code.toUpperCase()).eq('active', true).single();
  if (!data) return {valid:false, message:'Kod promo tidak sah.'};
  if (data.max_uses && data.used_count >= data.max_uses) return {valid:false, message:'Kod promo telah habis.'};
  return {valid:true, code:data, message:`Diskaun ${data.type==='percentage'?data.value+'%':'RM'+data.value} digunakan!`};
}
