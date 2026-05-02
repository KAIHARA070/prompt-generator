// =====================================================
// auth.js — Supabase Authentication
// =====================================================
// SECURITY: Added secure session validation and error handling

// ─── SECURITY: Session Validation ─────────────────

/**
 * Get session with security validation
 * SECURITY: Validates session expiration and token validity
 */
async function getSecureSession() {
  try {
    // Get session from Supabase (server-validated)
    const { data: { session }, error } = await sb.auth.getSession();

    if (error || !session) {
      clearSecureSession(); // Clear invalid session
      return null;
    }

    // Verify token hasn't expired (expires_at in seconds, Date.now() in ms)
    if (new Date().getTime() > session.expires_at * 1000) {
      clearSecureSession();
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      accessToken: session.access_token,
      expiresAt: session.expires_at,
    };
  } catch (error) {
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent('session_validation_error', { error: error.message });
    }
    clearSecureSession();
    return null;
  }
}

/**
 * Securely clear session
 * SECURITY: Clears all session data from localStorage and sessionStorage
 */
function clearSecureSession() {
  try {
    // Clear localStorage
    localStorage.removeItem('pgp_cached_session');
    localStorage.removeItem('session');
    
    // Clear sessionStorage
    sessionStorage.clear();

    // Clear form data (prevent autofill of sensitive fields)
    document.querySelectorAll('input[type="password"]').forEach(el => {
      el.value = '';
    });

    // Sign out from Supabase
    sb.auth.signOut().catch(err => {
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('signout_error', { error: err.message });
      }
    });
  } catch (error) {
    console.error('Clear session error:', error);
  }
}

/**
 * Enforce session security (prevent caching, enforce HTTPS)
 * SECURITY: Prevents sensitive pages from being cached in browser history
 */
function enforceSessionSecurity() {
  // Prevent caching of sensitive pages
  if (document.location.pathname.includes('dashboard') || 
      document.location.pathname.includes('admin') ||
      document.location.pathname.includes('profile')) {
    document.head.insertAdjacentHTML('beforeend', `
      <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0" />
      <meta http-equiv="Pragma" content="no-cache" />
      <meta http-equiv="Expires" content="0" />
    `);
  }

  // Prevent back-button cache on sensitive pages
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      // Page was restored from cache, re-validate session
      const dashboardPages = ['/dashboard.html', '/admin.html', '/profile.html'];
      const isProtectedPage = dashboardPages.some(p => window.location.pathname.includes(p));
      
      if (isProtectedPage) {
        getSecureSession().then(session => {
          if (!session) {
            // Session invalid, redirect to login
            window.location.href = '/login.html';
          }
        });
      }
    }
  });
}

// ── Register ──────────────────────────────────────
async function registerUser(userData) {
  try {
    // Rate limiting check
    const rateLimit = checkLoginLimit(userData.email);
    if (!rateLimit.allowed) {
      showToast(rateLimit.message, 'error');
      return { success: false, message: rateLimit.message };
    }

    const { data, error } = await sb.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { name: userData.name }
      }
    });

    if (error) {
      // Record failed attempt for rate limiting
      recordLoginAttempt(userData.email);
      return { success: false, message: error.message };
    }

    // Update profile with extra info
    if (data.user) {
      await sb.from('profiles').update({
        name: userData.name,
        business_type: userData.businessType,
        phone: userData.phone || null
      }).eq('id', data.user.id);
    }

    // Clear rate limit after successful registration
    clearLoginAttempts(userData.email);
    return { success: true, user: data.user };
  } catch (e) {
    recordLoginAttempt(userData.email);
    return { success: false, message: e.message || 'Ralat pendaftaran.' };
  }
}

// ── Login ─────────────────────────────────────────
async function loginUser(email, password) {
  try {
    // Rate limiting check
    const rateLimit = checkLoginLimit(email);
    if (!rateLimit.allowed) {
      showToast(rateLimit.message, 'error');
      return { success: false, message: rateLimit.message, rateLimited: true };
    }

    localStorage.clear();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Record failed login attempt
      recordLoginAttempt(email);
      return { success: false, message: error.message };
    }

    // Clear rate limit after successful login
    clearLoginAttempts(email);
    await cacheSession();
    return { success: true, user: data.user, session: data.session };
  } catch (e) {
    recordLoginAttempt(email);
    return { success: false, message: e.message || 'Ralat log masuk.' };
  }
}

// ── Google Login ──────────────────────────────────
async function loginWithGoogle() {
  try {
    // Rate limiting check
    const rateLimit = checkIpLimit();
    if (!rateLimit.allowed) {
      showToast(rateLimit.message, 'error');
      return;
    }

    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });
    if (error) throw error;
  } catch (e) {
    console.error("Google login error:", e.message);
    showToast(e.message, 'error');
  }
}

// ── Get Session ───────────────────────────────────
async function getSessionAsync() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

function getSession() {
  const stored = localStorage.getItem('pgp_cached_session');
  if (!stored) return null;
  try {
    const s = JSON.parse(stored);
    if (s && s.userId) return s;
  } catch(e) {}
  return null;
}

// ── Cache session for sync access ─────────────────
async function cacheSession() {
  try {
    const { data: { session }, error: sessionErr } = await sb.auth.getSession();
    if (sessionErr || !session) {
      localStorage.removeItem('pgp_cached_session');
      return null;
    }

    const { data: profile, error: profErr } = await sb
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const cached = {
      userId: session.user.id,
      name: profile?.name || session.user.user_metadata?.name || 'User',
      email: session.user.email,
      plan: profile?.plan || 'free',
      isAdmin: profile?.is_admin || false,
      initials: (profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2),
      avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || null
    };
    localStorage.setItem('pgp_cached_session', JSON.stringify(cached));
    return cached;
  } catch (err) {
    console.warn("Auth lock issue:", err.message);
    return getSession();
  }
}

// ── Get current user profile ──────────────────────
async function getCurrentProfile() {
  const session = await getSessionAsync();
  if (!session) return null;
  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}

// ── Update profile ────────────────────────────────
async function updateUserProfile(updates) {
  const session = await getSessionAsync();
  if (!session) return { success: false };
  const { error } = await sb
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', session.user.id);
  if (error) return { success: false, message: error.message };
  await cacheSession();
  return { success: true };
}

// ── Logout ────────────────────────────────────────
async function logout(redirect = true) {
  try {
    await sb.auth.signOut();
  } catch (e) {
    console.warn("SignOut error, forcing local clear.");
  }
  localStorage.clear();
  if (redirect) window.location.href = 'login.html';
}

// ── Auth guard ────────────────────────────────────
function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// ── Redirect if logged in ─────────────────────────
function redirectIfLoggedIn() {
  const session = getSession();
  if (session) window.location.href = 'dashboard.html';
}

// ── Populate user UI ──────────────────────────────
function populateUserUI(session) {
  if (!session) return;
  
  // Update text content
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = session.initials);
  document.querySelectorAll('[data-user-plan]').forEach(el => {
    const plan = session.plan?.toLowerCase();
    el.textContent = plan === 'pro' ? 'Pro' : plan === 'starter' ? 'Starter' : plan === 'agency' ? 'Agency' : 'Free';
  });

  // Handle avatars (from Google)
  if (session.avatar_url) {
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.style.backgroundImage = `url(${session.avatar_url})`;
      el.style.backgroundSize = 'cover';
      el.textContent = '';
    });
  }

  // Admin visibility
  document.querySelectorAll('[data-admin-only]').forEach(el => {
    if (!session.isAdmin) el.style.display = 'none';
    else el.style.display = '';
  });
}

// ── Listen to auth changes ────────────────────────
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    localStorage.clear();
  }
});
