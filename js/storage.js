// =====================================================
// storage.js — Supabase CRUD for prompts
// =====================================================

// ── Save new prompt ───────────────────────────────
async function savePrompt(promptData) {
  try {
    const session = getSession();
    if (!session) {
      showToast('Sila log masuk semula.', 'error');
      return null;
    }

    // Rate limiting check
    const rateLimit = checkPromptSaveLimit(session.userId);
    if (!rateLimit.allowed) {
      showToast(rateLimit.message, 'error');
      return null;
    }

    const { data, error } = await sb.from('prompts').insert({
      user_id: session.userId,
      title: promptData.title || promptData.formData?.businessName || 'Tanpa Tajuk',
      business_type: promptData.businessType,
      business_type_label: promptData.businessTypeLabel,
      form_data: promptData.formData || {},
      generated_prompt: promptData.generatedPrompt || '',
      tags: promptData.tags || []
    }).select().single();

    if (error) {
      console.error('savePrompt DB error:', error);
      showToast('Gagal menyimpan prompt. Sila coba lagi.', 'error');
      return null;
    }
    return data;
  } catch (err) {
    console.error('savePrompt exception:', err);
    showToast('Ralat teknikal semasa menyimpan.', 'error');
    return null;
  }
}

async function getUserPrompts() {
  const session = getSession();
  if (!session) return [];

  const { data, error } = await sb
    .from('prompts')
    .select('*')
    .eq('user_id', session.userId)
    .order('updated_at', { ascending: false });

  if (error) { console.error('getUserPrompts error:', error); return []; }
  return data || [];
}

async function getPromptById(id) {
  const { data, error } = await sb
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

async function updatePrompt(promptId, updates) {
  const { data, error } = await sb
    .from('prompts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', promptId)
    .select()
    .single();

  if (error) return { success: false, message: error.message };
  return { success: true, prompt: data };
}

async function deletePrompt(promptId) {
  const { error } = await sb
    .from('prompts')
    .delete()
    .eq('id', promptId);
  return { success: !error };
}

async function toggleFavourite(promptId) {
  const prompt = await getPromptById(promptId);
  if (!prompt) return false;

  const newVal = !prompt.is_favourite;
  await sb
    .from('prompts')
    .update({ is_favourite: newVal, updated_at: new Date().toISOString() })
    .eq('id', promptId);
  return newVal;
}

// ── Search prompts ────────────────────────────────
async function searchPrompts(query) {
  const session = getSession();
  if (!session) return [];
  if (!query || !query.trim()) return getUserPrompts();

  const q = query.toLowerCase().trim();
  const { data } = await sb
    .from('prompts')
    .select('*')
    .eq('user_id', session.userId)
    .or(`title.ilike.%${q}%,business_type_label.ilike.%${q}%`)
    .order('updated_at', { ascending: false });

  return data || [];
}

// ── Filter prompts ────────────────────────────────
async function filterPrompts(type = 'all', favouriteOnly = false) {
  const session = getSession();
  if (!session) return [];

  let query = sb.from('prompts').select('*').eq('user_id', session.userId);
  if (type !== 'all') query = query.eq('business_type', type);
  if (favouriteOnly) query = query.eq('is_favourite', true);
  query = query.order('updated_at', { ascending: false });

  const { data } = await query;
  return data || [];
}

// ── Get stats ─────────────────────────────────────
async function getUserStats() {
  const prompts = await getUserPrompts();
  const now = new Date();
  const weekAgo = new Date(now - 7 * 864e5);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeek = prompts.filter(p => new Date(p.created_at) > weekAgo).length;
  const thisMonth = prompts.filter(p => new Date(p.created_at) > monthStart).length;

  const typeCounts = {};
  prompts.forEach(p => {
    const label = p.business_type_label || p.business_type;
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  });

  let topType = '-';
  let topCount = 0;
  Object.entries(typeCounts).forEach(([label, count]) => {
    if (count > topCount) { topType = label; topCount = count; }
  });

  return {
    total: prompts.length,
    thisWeek,
    thisMonth,
    topType,
    favourites: prompts.filter(p => p.is_favourite).length
  };
}

// ── Draft (still localStorage — temporary) ───────
function saveDraft(formData, businessType) {
  localStorage.setItem('pgp_draft', JSON.stringify({ formData, businessType, savedAt: new Date().toISOString() }));
}
function loadDraft() {
  try { return JSON.parse(localStorage.getItem('pgp_draft')); } catch { return null; }
}
function clearDraft() {
  localStorage.removeItem('pgp_draft');
}

// ── Relative time helper ──────────────────────────
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'baru sahaja';
  if (m < 60) return `${m} minit lepas`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lepas`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lepas`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} minggu lepas`;
  return new Date(isoString).toLocaleDateString('ms-MY');
}
