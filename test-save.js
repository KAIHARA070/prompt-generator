const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://ddwdwbhcnonbhmlipuvm.supabase.co', 'sb_publishable_REOH4QcENBCviLSQJg3Tdg_N98y5CG7');

async function testSave() {
  console.log("1. Logging in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'cloudhosting070@gmail.com',
    password: 'P@ssw0rd'
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
