(function () {
  const STORAGE_KEY = 'pgp_lang';
  const DEFAULT_LANG = 'en-US';
  const SUPPORTED = ['en-US', 'ms-MY'];

  const MESSAGES = {
    'en-US': {
      // Common
      'lang.english': 'English (US)',
      'lang.malay': 'Bahasa Melayu',
      'nav.features': 'Features',
      'nav.how': 'How It Works',
      'nav.testimonials': 'Testimonials',
      'nav.pricing': 'Pricing',
      'nav.login': 'Log In',
      'nav.signup': 'Sign Up Free',
      'nav.dashboard': 'Dashboard',
      'nav.admin': 'Admin',
      'nav.affiliate': 'Affiliate',

      // Index
      'index.hero.badgeNew': 'New!',
      'index.hero.badgeText': 'Generate production HTML with AI',
      'index.hero.title': 'Generate A Business Landing Page in 60 Seconds',
      'index.hero.subtitle': 'AI tuned for local businesses. Build a professional site without coding.',
      'index.hero.ctaPrimary': 'Try Free for 7 Days',
      'index.hero.ctaSecondary': 'Watch Demo',
      'index.hero.trust': 'Trusted by 2,000+ business owners',
      'index.section.why': 'Why Choose Prompt Generator Pro?',
      'index.section.whySub': 'Everything you need to launch your business online.',
      'index.section.how': 'How It Works',
      'index.section.howSub': 'Just 4 simple steps.',
      'index.section.testimonials': 'What Customers Say',
      'index.section.testimonialsSub': 'Thousands of businesses already use Prompt Generator Pro.',
      'index.cta.title': 'Start Today',
      'index.cta.subtitle': '7-day free trial. No credit card required.',
      'index.cta.button': 'Start Free Now',
      'index.footer.copy': 'All rights reserved.',

      // Login
      'login.title': 'Sign in to your account',
      'login.subtitle': 'Welcome back. Please enter your details to continue.',
      'login.email': 'Email address',
      'login.password': 'Password',
      'login.passwordPlaceholder': 'Enter your password',
      'login.remember': 'Remember me',
      'login.forgot': 'Forgot password?',
      'login.signin': 'Sign in',
      'login.continueGoogle': 'Continue with Google',
      'login.noAccount': "Don't have an account?",
      'login.createOne': 'Create one',
      'login.secureNote': 'Protected access for authorized users only.',
      'login.err.emailRequired': 'Email is required',
      'login.err.passwordRequired': 'Password is required',
      'login.toast.welcome': 'Welcome back!',

      // Register
      'register.title': 'Create your account',
      'register.subtitle': 'Start building your prompts in minutes.',
      'register.confirmPassword': 'Confirm password',
      'register.createAccount': 'Create account',
      'register.haveAccount': 'Already have an account?',
      'register.signin': 'Sign in',
      'register.err.emailInvalid': 'Invalid email format',
      'register.err.passwordShort': 'Password must be at least 8 characters',
      'register.err.passwordMatch': 'Passwords do not match',
      'register.toast.created': 'Account created successfully!',

      // Dashboard
      'dash.main': 'Main',
      'dash.newPrompt': 'Create Prompt',
      'dash.saved': 'Saved Prompts',
      'dash.other': 'Other',
      'dash.pricing': 'Pricing & Plans',
      'dash.account': 'Account',
      'dash.logout': 'Log Out',
      'dash.welcome': 'Welcome!',
      'dash.savedCount': 'You have',
      'dash.savedCountSuffix': 'saved prompts.',
      'dash.stat.total': 'Total Prompts',
      'dash.stat.week': 'This Week',
      'dash.stat.fav': 'Favorites',
      'dash.quick': 'Quick Actions',
      'dash.action.create': 'Create Prompt',
      'dash.action.viewAll': 'View All Prompts',
      'dash.action.fav': 'Favorite Prompts',
      'dash.recent': 'Recent Prompts',
      'dash.seeAll': 'See All',
      'dash.emptyTitle': 'No Prompts Yet',
      'dash.emptyText': 'Create your first prompt to get started!',
      'dash.generateNow': 'Generate Now',
      'dash.modal.view': 'View Prompt',
      'dash.modal.confirm': 'Confirmation',
      'dash.modal.cancel': 'Cancel',
      'dash.modal.delete': 'Yes, Delete',
      'dash.meta.prompt': 'Prompt',
      'dash.view': 'View',
      'dash.edit': 'Edit',
      'dash.copy': 'Copy',
      'dash.emptyPrompt': '(Empty prompt)',
      'dash.favouriteUpdated': 'Favorite updated!',
      'dash.deleteConfirm': 'Delete this prompt? This action cannot be undone.',
      'dash.deleted': 'Prompt deleted.',

      // Saved prompts
      'saved.title': 'Saved Prompts',
      'saved.found': 'prompts found',
      'saved.search': 'Search prompts...',
      'saved.sort.newest': 'Newest first',
      'saved.sort.oldest': 'Oldest first',
      'saved.sort.fav': 'Favorites first',
      'saved.tab.all': 'All',
      'saved.tab.fav': 'Favorites',
      'saved.useClaude': 'Use in Claude',
      'saved.close': 'Close',
      'saved.deleteTitle': 'Delete Confirmation',
      'saved.emptyTitle': 'No Prompts Found',
      'saved.emptyText': 'Try another keyword or create a new prompt.',
      'saved.favorite': 'Add favorite',
      'saved.unfavorite': 'Remove favorite',
      'saved.chars': 'chars',
      'saved.addedFav': 'Added to favorites',
      'saved.removedFav': 'Removed from favorites'
    },
    'ms-MY': {
      // Common
      'lang.english': 'English (US)',
      'lang.malay': 'Bahasa Melayu',
      'nav.features': 'Ciri-ciri',
      'nav.how': 'Cara Kerja',
      'nav.testimonials': 'Testimoni',
      'nav.pricing': 'Harga',
      'nav.login': 'Log Masuk',
      'nav.signup': 'Daftar Percuma',
      'nav.dashboard': 'Dashboard',
      'nav.admin': 'Admin',
      'nav.affiliate': 'Affiliate',

      // Index
      'index.hero.badgeNew': 'Baru!',
      'index.hero.badgeText': 'Jana HTML sebenar dengan AI',
      'index.hero.title': 'Jana Landing Page Perniagaan dalam 60 Saat',
      'index.hero.subtitle': 'AI yang faham perniagaan tempatan. Cipta website profesional tanpa coding.',
      'index.hero.ctaPrimary': 'Cuba Percuma 7 Hari',
      'index.hero.ctaSecondary': 'Tengok Demo',
      'index.hero.trust': 'Dipercayai oleh 2,000+ pemilik perniagaan',
      'index.section.why': 'Kenapa Pilih Prompt Generator Pro?',
      'index.section.whySub': 'Semua yang anda perlukan untuk bina kehadiran online.',
      'index.section.how': 'Cara Mudahnya',
      'index.section.howSub': 'Hanya 4 langkah ringkas.',
      'index.section.testimonials': 'Apa Kata Pelanggan',
      'index.section.testimonialsSub': 'Ribuan perniagaan sudah menggunakan Prompt Generator Pro.',
      'index.cta.title': 'Mulakan Hari Ini',
      'index.cta.subtitle': 'Cuba percuma 7 hari tanpa kad kredit.',
      'index.cta.button': 'Cuba Percuma Sekarang',
      'index.footer.copy': 'Semua hak terpelihara.',

      // Login
      'login.title': 'Log masuk ke akaun anda',
      'login.subtitle': 'Selamat kembali. Sila masukkan maklumat anda.',
      'login.email': 'Alamat emel',
      'login.password': 'Kata laluan',
      'login.passwordPlaceholder': 'Masukkan kata laluan',
      'login.remember': 'Ingat saya',
      'login.forgot': 'Lupa kata laluan?',
      'login.signin': 'Log masuk',
      'login.continueGoogle': 'Teruskan dengan Google',
      'login.noAccount': 'Belum ada akaun?',
      'login.createOne': 'Cipta akaun',
      'login.secureNote': 'Akses dilindungi untuk pengguna berdaftar sahaja.',
      'login.err.emailRequired': 'Email diperlukan',
      'login.err.passwordRequired': 'Kata laluan diperlukan',
      'login.toast.welcome': 'Selamat kembali!',

      // Register
      'register.title': 'Cipta akaun anda',
      'register.subtitle': 'Mula bina prompt anda dalam beberapa minit.',
      'register.confirmPassword': 'Sahkan kata laluan',
      'register.createAccount': 'Cipta akaun',
      'register.haveAccount': 'Sudah ada akaun?',
      'register.signin': 'Log masuk',
      'register.err.emailInvalid': 'Format email tidak sah',
      'register.err.passwordShort': 'Kata laluan mesti sekurang-kurangnya 8 aksara',
      'register.err.passwordMatch': 'Kata laluan tidak sepadan',
      'register.toast.created': 'Akaun berjaya dicipta!',

      // Dashboard
      'dash.main': 'Utama',
      'dash.newPrompt': 'Jana Prompt Baru',
      'dash.saved': 'Prompt Tersimpan',
      'dash.other': 'Lain-lain',
      'dash.pricing': 'Harga & Pelan',
      'dash.account': 'Akaun',
      'dash.logout': 'Log Keluar',
      'dash.welcome': 'Selamat datang!',
      'dash.savedCount': 'Anda mempunyai',
      'dash.savedCountSuffix': 'prompt tersimpan.',
      'dash.stat.total': 'Jumlah Prompt',
      'dash.stat.week': 'Jana Minggu Ini',
      'dash.stat.fav': 'Kegemaran',
      'dash.quick': 'Tindakan Pantas',
      'dash.action.create': 'Jana Prompt Baru',
      'dash.action.viewAll': 'Lihat Semua Prompt',
      'dash.action.fav': 'Prompt Kegemaran',
      'dash.recent': 'Prompt Terbaru',
      'dash.seeAll': 'Lihat Semua',
      'dash.emptyTitle': 'Tiada Prompt Lagi',
      'dash.emptyText': 'Jana prompt pertama anda untuk memulakan!',
      'dash.generateNow': 'Jana Sekarang',
      'dash.modal.view': 'Lihat Prompt',
      'dash.modal.confirm': 'Pengesahan',
      'dash.modal.cancel': 'Batal',
      'dash.modal.delete': 'Ya, Padam',
      'dash.meta.prompt': 'Prompt',
      'dash.view': 'Lihat',
      'dash.edit': 'Edit',
      'dash.copy': 'Salin',
      'dash.emptyPrompt': '(Prompt kosong)',
      'dash.favouriteUpdated': 'Kegemaran dikemas kini!',
      'dash.deleteConfirm': 'Padam prompt ini? Tindakan ini tidak boleh dibatalkan.',
      'dash.deleted': 'Prompt dipadam.',

      // Saved prompts
      'saved.title': 'Prompt Tersimpan',
      'saved.found': 'prompt dijumpai',
      'saved.search': 'Cari prompt...',
      'saved.sort.newest': 'Terbaru dahulu',
      'saved.sort.oldest': 'Terlama dahulu',
      'saved.sort.fav': 'Kegemaran dahulu',
      'saved.tab.all': 'Semua',
      'saved.tab.fav': 'Kegemaran',
      'saved.useClaude': 'Guna di Claude',
      'saved.close': 'Tutup',
      'saved.deleteTitle': 'Pengesahan Padam',
      'saved.emptyTitle': 'Tiada Prompt Dijumpai',
      'saved.emptyText': 'Cuba cari dengan kata kunci lain atau jana prompt baharu.',
      'saved.favorite': 'Tambah kegemaran',
      'saved.unfavorite': 'Buang kegemaran',
      'saved.chars': 'aksara',
      'saved.addedFav': 'Ditambah ke kegemaran',
      'saved.removedFav': 'Dibuang dari kegemaran'
    }
  };

  function getLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return DEFAULT_LANG;
  }

  function setLanguage(lang) {
    const next = SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'ms-MY' ? 'ms' : 'en';
    applyI18n();
  }

  function t(key, fallback) {
    const lang = getLanguage();
    return (MESSAGES[lang] && MESSAGES[lang][key]) || (MESSAGES[DEFAULT_LANG] && MESSAGES[DEFAULT_LANG][key]) || fallback || key;
  }

  function applyI18n(root) {
    const scope = root || document;

    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key, el.textContent);
    });

    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key, el.getAttribute('placeholder') || ''));
    });

    scope.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      el.setAttribute('aria-label', t(key, el.getAttribute('aria-label') || ''));
    });

    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', t(key, el.getAttribute('title') || ''));
    });
  }

  function initLanguageSwitcher(selectId) {
    const select = document.getElementById(selectId || 'langSwitcher');
    if (!select) return;

    select.innerHTML = '';
    const options = [
      { value: 'en-US', label: t('lang.english', 'English (US)') },
      { value: 'ms-MY', label: t('lang.malay', 'Bahasa Melayu') }
    ];

    options.forEach((opt) => {
      const node = document.createElement('option');
      node.value = opt.value;
      node.textContent = opt.label;
      select.appendChild(node);
    });

    select.value = getLanguage();
    select.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  function initI18n(selectId) {
    document.documentElement.lang = getLanguage() === 'ms-MY' ? 'ms' : 'en';
    initLanguageSwitcher(selectId || 'langSwitcher');
    applyI18n();
  }

  window.getLanguage = getLanguage;
  window.setLanguage = setLanguage;
  window.i18nText = t;
  window.applyI18n = applyI18n;
  window.initI18n = initI18n;
})();