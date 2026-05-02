require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_TEST_EMAIL = process.env.SUPABASE_TEST_EMAIL;
const SUPABASE_TEST_PASSWORD = process.env.SUPABASE_TEST_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_TEST_EMAIL || !SUPABASE_TEST_PASSWORD) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_TEST_EMAIL, SUPABASE_TEST_PASSWORD');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSave() {
  console.log("1. Logging in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: SUPABASE_TEST_EMAIL,
    password: SUPABASE_TEST_PASSWORD
  });

  if (authErr) {
    console.error("Login failed:", authErr.message);
    return;
  }
  console.log("Login success. User ID:", authData.user.id);

  console.log("\n2. Checking Profile & Admin status...");
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  if (profErr) {
    console.error("Failed to fetch profile:", profErr.message, profErr.details);
  } else {
    console.log("Profile found:", profile.name);
    console.log("Is Admin?", profile.is_admin);
    
    // Update to admin if not already
    if (!profile.is_admin) {
      console.log("Attempting to set as Admin...");
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', authData.user.id);
      if (updateErr) console.log("Could not set admin (expected if RLS blocks it):", updateErr.message);
    }
  }

  console.log("\n3. Attempting to save a prompt...");
  const testPrompt = {
    user_id: authData.user.id,
    title: 'Test Prompt Diagnostic',
    business_type: 'cafe',
    business_type_label: 'Kafe',
    form_data: { test: true },
    generated_prompt: 'This is a test prompt',
    tags: ['cafe']
  };

  const { data: saved, error: saveErr } = await supabase
    .from('prompts')
    .insert(testPrompt)
    .select()
    .single();

  if (saveErr) {
    console.error("\n❌ FAILED TO SAVE PROMPT!");
    console.error("Error Code:", saveErr.code);
    console.error("Error Message:", saveErr.message);
    console.error("Error Details:", saveErr.details);
    console.error("Error Hint:", saveErr.hint);
  } else {
    console.log("\n✅ PROMPT SAVED SUCCESSFULLY!");
    console.log("Saved ID:", saved.id);
  }
}

testSave();
