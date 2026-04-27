// ===================================================
// generator.js — Prompt generation logic & templates
// ===================================================

const BUSINESS_TEMPLATES = {
  // ── MAKANAN & MINUMAN ──────────────────────────
  restaurant : { label:'🍜 Restoran / Kedai Makan', icon:'🍜', category:'Makanan', tone:'Kasual & Mesra',       sections:['Menu Pilihan','Galeri Makanan','Reservasi Online','Ulasan Pelanggan','Lokasi & Hubungi'] },
  cafe       : { label:'☕ Kafe / Kedai Kopi',       icon:'☕', category:'Makanan', tone:'Santai & Trendy',      sections:['Menu Minuman','Ruang Santai','Wifi & Fasiliti','Acara Khas','Galeri'] },
  bakery     : { label:'🍰 Kedai Kek & Bakeri',      icon:'🍰', category:'Makanan', tone:'Hangat & Manis',       sections:['Katalog Produk','Tempahan Khas','Penghantaran','Testimoni'] },
  foodtruck  : { label:'🚐 Food Truck',              icon:'🚐', category:'Makanan', tone:'Kasual & Meriah',      sections:['Menu','Lokasi Harian','Cara Pesan','Galeri'] },

  // ── FESYEN & PAKAIAN ───────────────────────────
  fashion    : { label:'👗 Butik / Fesyen',          icon:'👗', category:'Fesyen',  tone:'Mewah & Bergaya',      sections:['Koleksi Terbaru','Lookbook','Panduan Saiz','Cara Beli'] },
  hijab      : { label:'🧕 Butik Hijab & Tudung',    icon:'🧕', category:'Fesyen',  tone:'Elegan & Sopan',       sections:['Koleksi','Tutorial Pakai','Testimoni','Kedai Online'] },
  kids       : { label:'👶 Pakaian Kanak-kanak',     icon:'👶', category:'Fesyen',  tone:'Ceria & Selamat',      sections:['Koleksi','Panduan Umur','Promosi','Hubungi'] },

  // ── KECANTIKAN & KESIHATAN ─────────────────────
  salon      : { label:'💇 Salon / Barbershop',      icon:'💇', category:'Kecantikan',tone:'Profesional & Trendy',sections:['Perkhidmatan','Harga','Galeri','Tempah Temujanji'] },
  spa        : { label:'💆 Spa & Wellness',           icon:'💆', category:'Kecantikan',tone:'Tenang & Mewah',     sections:['Rawatan','Pakej','Galeri','Tempahan'] },
  skincare   : { label:'✨ Produk Skincare',          icon:'✨', category:'Kecantikan',tone:'Bersih & Saintifik', sections:['Produk','Bahan-bahan','Cara Guna','Sebelum & Selepas'] },
  gym        : { label:'💪 Gym / Fitness',            icon:'💪', category:'Kecantikan',tone:'Energi & Motivasi',  sections:['Program','Jurulatih','Harga Keahlian','Kemudahan'] },

  // ── PENDIDIKAN ────────────────────────────────
  tuition    : { label:'📚 Pusat Tuisyen',            icon:'📚', category:'Pendidikan',tone:'Profesional & Mesra',sections:['Program','Guru Kami','Jadual','Daftar'] },
  onlineCourse:{ label:'🎓 Kursus Online',            icon:'🎓', category:'Pendidikan',tone:'Motivasi & Profesional',sections:['Kursus','Kurikulum','Pengajar','Harga & Daftar'] },
  kindergarten:{ label:'🏫 Tadika / Prasekolah',      icon:'🏫', category:'Pendidikan',tone:'Ceria & Mesra',      sections:['Program','Aktiviti','Kemudahan','Pendaftaran'] },

  // ── PERKHIDMATAN PROFESIONAL ──────────────────
  contractor : { label:'🏗️ Kontraktor / Pembinaan',  icon:'🏗️', category:'Profesional',tone:'Dipercayai & Kuat', sections:['Perkhidmatan','Portfolio','Testimoni','Sebutharga'] },
  accounting : { label:'📊 Perakaunan / Cukai',       icon:'📊', category:'Profesional',tone:'Profesional',        sections:['Perkhidmatan','Pakej','FAQ','Hubungi'] },
  legal      : { label:'⚖️ Firma Guaman',             icon:'⚖️', category:'Profesional',tone:'Authoriti & Formal', sections:['Bidang Amalan','Peguam','Kes Berjaya','Konsultasi'] },
  insurance  : { label:'🛡️ Insurans / Takaful',       icon:'🛡️', category:'Profesional',tone:'Amanah & Selamat',   sections:['Produk','Kalkulator','Ejen','Hubungi'] },

  // ── HARTANAH ──────────────────────────────────
  property   : { label:'🏠 Ejen Hartanah',            icon:'🏠', category:'Hartanah', tone:'Profesional & Amanah',sections:['Senarai Properti','Ejen','Kalkulator','Hubungi'] },
  propDev    : { label:'🏢 Pemaju Hartanah',           icon:'🏢', category:'Hartanah', tone:'Mewah & Eksklusif',   sections:['Projek','Konsep','Kemudahan','Daftar Minat'] },

  // ── AUTOMOTIF ─────────────────────────────────
  workshop   : { label:'🔧 Bengkel / Workshop',        icon:'🔧', category:'Automotif',tone:'Dipercayai & Teknikal',sections:['Perkhidmatan','Harga','Testimoni','Lokasi'] },
  carRental  : { label:'🚗 Sewa Kereta',               icon:'🚗', category:'Automotif',tone:'Mudah & Fleksibel',    sections:['Armada','Pakej','Cara Tempah','Terma'] },

  // ── TEKNOLOGI ────────────────────────────────
  itService  : { label:'💻 Perkhidmatan IT',           icon:'💻', category:'Teknologi',tone:'Moden & Inovatif',    sections:['Perkhidmatan','Teknologi','Portfolio','Hubungi'] },
  webDesign  : { label:'🎨 Web Design / Dev',          icon:'🎨', category:'Teknologi',tone:'Kreatif & Profesional',sections:['Portfolio','Perkhidmatan','Proses','Harga'] },
  app        : { label:'📱 Pembangunan Aplikasi',       icon:'📱', category:'Teknologi',tone:'Inovatif & Moden',    sections:['Perkhidmatan','Portfolio','Proses','Pakej'] },

  // ── ACARA & HIBURAN ───────────────────────────
  event      : { label:'🎉 Penganjur Acara',            icon:'🎉', category:'Acara',   tone:'Meriah & Kreatif',    sections:['Perkhidmatan','Portfolio','Pakej','Tempah'] },
  photography: { label:'📷 Fotografi / Videografi',     icon:'📷', category:'Acara',   tone:'Artistik & Profesional',sections:['Portfolio','Pakej','Cara Tempah','Hubungi'] },

  // ── LOGISTIK ─────────────────────────────────
  logistics  : { label:'🚚 Logistik / Penghantaran',    icon:'🚚', category:'Logistik',tone:'Pantas & Dipercayai', sections:['Perkhidmatan','Zon Penghantaran','Harga','Track'] },

  // ── E-COMMERCE ───────────────────────────────
  ecommerce  : { label:'🛒 E-Commerce Umum',            icon:'🛒', category:'E-Commerce',tone:'Moden & Mesra',      sections:['Produk','Kategori','Cara Beli','FAQ'] },

  // ── DIGITAL CARDS ─────────────────────────────
  weddingCard: { label:'💍 Kad Kawin Digital',          icon:'💍', category:'Kad Digital',tone:'Romantik & Elegan', sections:['Mempelai','Aturcara','Peta Lokasi','RSVP','Galeri Gambar','Ucapan'] },
  businessCard:{ label:'📇 Kad Bisnes Digital',         icon:'📇', category:'Kad Digital',tone:'Profesional & Moden',sections:['Profil','Hubungi','Social Media','vCard','Portfolio'] }
};

// ───────────────────────────────────────────────────
// MAIN GENERATOR FUNCTION
// ───────────────────────────────────────────────────
function generatePrompt(formData, businessType) {
  const tpl = BUSINESS_TEMPLATES[businessType] || {};
  const lang = formData.language || 'ms'; // Default to Malay

  const langMap = {
    ms: { header: 'Cipta landing page HTML yang lengkap', info: 'MAKLUMAT PERNIAGAAN', design: 'REKA BENTUK & GAYA', features: 'CIRI KHUSUS', tech: 'KEPERLUAN TEKNIKAL', output: 'FORMAT OUTPUT' },
    en: { header: 'Create a complete, responsive HTML landing page', info: 'BUSINESS INFORMATION', design: 'DESIGN & STYLE', features: 'SPECIFIC FEATURES', tech: 'TECHNICAL REQUIREMENTS', output: 'OUTPUT FORMAT' },
    id: { header: 'Buat landing page HTML yang lengkap dan responsif', info: 'INFORMASI BISNIS', design: 'DESAIN & GAYA', features: 'FITUR KHUSUS', tech: 'PERSYARATAN TEKNIS', output: 'FORMAT OUTPUT' }
  };

  const l = langMap[lang] || langMap.ms;

  const parts = [
    buildHeader(formData, businessType, tpl, l, lang),
    buildInfoSection(formData, tpl, l),
    buildDesignSection(formData, l),
    buildContactSection(formData, l),
    buildFeaturesSection(formData, businessType, tpl, l),
    buildTechnicalSection(tpl, l),
    buildOutputFormat(formData, l, lang)
  ];

  return parts.filter(Boolean).join('\n\n');
}

function buildHeader(d, type, tpl, l, lang) {
  return `${l.header} untuk ${d.businessName || 'perniagaan ini'}.
  
Bahasa Kandungan: Sila gunakan ${lang === 'ms' ? 'Bahasa Malaysia' : lang === 'en' ? 'English' : 'Bahasa Indonesia'} sepenuhnya untuk semua teks di dalam website.

Ini adalah website ${tpl.label || type} yang memerlukan rekabentuk profesional, kod yang bersih, dan pengalaman pengguna yang luar biasa. Hasilkan KOD HTML PENUH yang boleh terus digunakan.`;
}

function buildInfoSection(d, tpl) {
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `📋 MAKLUMAT PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Nama Perniagaan   : ${d.businessName || '-'}`,
    `Jenis Perniagaan  : ${tpl.label || '-'}`,
    d.location ? `Lokasi            : ${d.location}` : '',
    ``,
    `PENERANGAN:`,
    d.description || '(tiada penerangan)',
    ``,
    `KHALAYAK SASARAN:`,
    d.targetAudience || '(umum)',
    ``,
    `KELEBIHAN UNIK (USP):`,
    d.usp || '(tidak dinyatakan)'
  ];
  return lines.filter(l => l !== null).join('\n');
}

function buildDesignSection(d) {
  return [
    `═══════════════════════════════════════════════════════`,
    `🎨 REKA BENTUK & GAYA`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Warna Utama    : ${d.primaryColor || '#1a1a2e'}`,
    `Warna Sekunder : ${d.secondaryColor || '#e94560'}`,
    `Warna Aksen    : ${d.accentColor || '#0f3460'}`,
    `Nada Komunikasi: ${d.tone || 'Profesional & Mesra'}`,
    `Gaya Rekabentuk: ${d.style || 'Moden & Bersih'}`,
    `Call-to-Action : "${d.cta || 'Hubungi Kami Sekarang'}"`,
    ``,
    `Arahan rekabentuk:`,
    `- Gunakan warna utama sebagai warna dominan`,
    `- Tambah gradient yang cantik menggunakan warna yang ditetapkan`,
    `- Animasi halus pada scroll (fade-in, slide-up)`,
    `- Hover effects yang menarik pada semua elemen interaktif`,
    `- Glassmorphism atau card design yang moden`
  ].join('\n');
}

function buildContactSection(d) {
  const c = d.contact || {};
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `📞 MAKLUMAT HUBUNGAN`,
    `═══════════════════════════════════════════════════════`,
    ``
  ];
  if (c.phone)    lines.push(`Telefon  : ${c.phone}`);
  if (c.email)    lines.push(`Email    : ${c.email}`);
  if (c.whatsapp) lines.push(`WhatsApp : ${c.whatsapp} → https://wa.me/${c.whatsapp.replace(/\D/g,'')}`);
  if (c.facebook) lines.push(`Facebook : ${c.facebook}`);
  if (c.instagram)lines.push(`Instagram: ${c.instagram}`);
  if (c.address)  lines.push(`Alamat   : ${c.address}`);
  if (lines.length === 4) lines.push('(maklumat hubungan tidak diisi)');
  return lines.join('\n');
}

function buildFeaturesSection(d, businessType, tpl) {
  const specificMap = {
    restaurant : `- Sertakan menu dengan kategori (Makanan Utama, Minuman, Pencuci Mulut)\n- Galeri makanan dengan hover zoom\n- Sistem reservasi meja (form)\n- Waktu operasi yang jelas\n- Google Maps embed`,
    cafe       : `- Menu minuman dengan harga\n- Section "Work & Study" (wifi, plug point)\n- Galeri suasana kafe\n- Acara khas bulanan`,
    bakery     : `- Katalog kek dan bakeri dengan gambar\n- Form tempahan khas\n- Info penghantaran dan kawasan\n- Testimoni pelanggan`,
    fashion    : `- Grid produk dengan filter kategori\n- Lookbook section\n- Panduan saiz interaktif\n- Butang "Order via WhatsApp"`,
    hijab      : `- Koleksi hijab dengan warna/saiz\n- Video tutorial cara pakai\n- Testimoni foto pelanggan\n- Link kedai Shopee/Lazada`,
    salon      : `- Senarai perkhidmatan dengan harga\n- Galeri before/after\n- Form tempahan temujanji\n- Profil stylist`,
    spa        : `- Senarai rawatan dan durasi\n- Pakej promosi\n- Galeri suasana spa\n- Form tempahan`,
    skincare   : `- Senarai produk dengan bahan aktif\n- Panduan rutin skincare\n- Sebelum & selepas section\n- Testimoni bintang`,
    tuition    : `- Program mengikut umur/tahap\n- Profil guru\n- Jadual kelas\n- Form pendaftaran`,
    onlineCourse:`- Senarai kursus dengan harga\n- Preview kurikulum\n- Profil pengajar\n- Testimoni pelajar\n- FAQ`,
    contractor : `- Senarai perkhidmatan pembinaan\n- Gallery portfolio projek\n- Testimoni klien\n- Form sebutharga percuma`,
    property   : `- Grid listing hartanah (gambar, harga, lokasi)\n- Kalkulator ansuran\n- Profil ejen\n- WhatsApp terus dengan ejen`,
    workshop   : `- Senarai servis dengan harga anggaran\n- Kereta yang dikhidmati\n- Testimoni pelanggan\n- Lokasi & waktu operasi`,
    ecommerce  : `- Grid produk dengan filter kategori\n- Badge "Terlaris" / "Baru"\n- Butang "Tambah Troli" atau "Order WhatsApp"\n- Section testimoni dengan bintang rating\n- FAQ pembayaran & penghantaran`,
    event      : `- Gallery acara lepas\n- Pakej perkhidmatan dengan harga\n- Senarai klien terdahulu\n- Form tempahan acara`,
    logistics  : `- Zon penghantaran & harga\n- Kalkulator kos penghantaran\n- Form tracking\n- Cara penghantaran`,
    gym        : `- Program latihan\n- Pakej keahlian dengan harga\n- Profil jurulatih\n- Kemudahan gim`,
    itService  : `- Senarai perkhidmatan IT\n- Portfolio projek\n- Teknologi yang digunakan\n- Pakej penyelenggaraan`,
    weddingCard: `- Nama pengantin & latar belakang\n- Countdown timer ke tarikh majlis\n- RSVP form interaktif dengan database (simulasi)\n- Peta Google Maps & butang "Waze/Maps"\n- Galeri gambar carousel\n- Section ucapan (Guestbook)`,
    businessCard: `- Foto profil & bio ringkas\n- Butang "Simpan Kenalan" (vCard simulation)\n- Social media icons yang besar & jelas\n- Portfolio mini atau link-link penting\n- Form hubungi atau WhatsApp`
  };

  const specific = specificMap[businessType] || `- Sertakan bahagian yang sesuai dengan jenis perniagaan ini\n- Pastikan ada section produk/perkhidmatan, galeri, dan hubungi`;
  const sections = (tpl.sections || []).map(s => `  ✦ ${s}`).join('\n');

  const extra = d.extraFeatures?.length
    ? `\nCiri-ciri Tambahan yang Diminta:\n${d.extraFeatures.map(f=>`  ✦ ${f}`).join('\n')}`
    : '';

  return [
    `═══════════════════════════════════════════════════════`,
    `🏪 CIRI KHUSUS JENIS PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Bahagian yang MESTI ada:`,
    sections,
    ``,
    `Arahan Khusus:`,
    specific,
    extra
  ].filter(Boolean).join('\n');
}

function buildTechnicalSection(tpl) {
  return [
    `═══════════════════════════════════════════════════════`,
    `⚙️ KEPERLUAN TEKNIKAL`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `1. STRUKTUR HTML:`,
    `   - HTML5 semantik (header, nav, main, section, article, footer)`,
    `   - Meta tags lengkap (charset, viewport, description, og:tags)`,
    `   - Schema.org structured data untuk SEO`,
    ``,
    `2. CSS (dalam tag <style>):`,
    `   - CSS Variables untuk tema warna`,
    `   - Mobile-first responsive design`,
    `   - Breakpoints: 480px, 768px, 1024px, 1280px`,
    `   - CSS Grid & Flexbox`,
    `   - Smooth transitions (0.3s ease)`,
    `   - Scroll animations dengan Intersection Observer API`,
    `   - Hover effects pada semua kad dan butang`,
    ``,
    `3. JAVASCRIPT (dalam tag <script>):`,
    `   - Vanilla JS sahaja (tiada framework)`,
    `   - Hamburger menu untuk mobile`,
    `   - Smooth scroll navigation`,
    `   - Form validation dengan mesej ralat`,
    `   - Sticky navbar`,
    `   - Back-to-top button`,
    `   - WhatsApp click-to-chat integration`,
    `   - Scroll reveal animations`,
    ``,
    `4. ASSETS:`,
    `   - Font dari Google Fonts CDN (Outfit atau Poppins)`,
    `   - Icons dari Font Awesome 6 CDN`,
    `   - Gambar placeholder dari picsum.photos atau unsplash.com`,
    ``,
    `5. KEBOLEHCAPAIAN:`,
    `   - Alt text untuk semua gambar`,
    `   - ARIA labels pada elemen interaktif`,
    `   - Kontras warna yang mencukupi`,
    `   - Tab navigation berfungsi`
  ].join('\n');
}

function buildOutputFormat(d) {
  return [
    `═══════════════════════════════════════════════════════`,
    `📄 FORMAT OUTPUT & ARAHAN PENTING`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Berikan SATU fail HTML yang LENGKAP dengan:`,
    `1. Semua CSS dalam tag <style> di dalam <head>`,
    `2. Semua JavaScript dalam tag <script> sebelum </body>`,
    `3. TIADA fail luaran kecuali CDN (Google Fonts, Font Awesome)`,
    ``,
    `PENTING — Pastikan:`,
    `✅ WhatsApp link: https://wa.me/${(d.contact?.whatsapp||'601XXXXXXXX').replace(/\D/,'')}`,
    `✅ Semua butang CTA menonjol dan mendorong tindakan`,
    `✅ Landing page boleh "convert" (ada clear value proposition)`,
    `✅ Kod LENGKAP, bukan sebahagian atau placeholder`,
    `✅ Responsif sempurna pada mobile (320px - 428px)`,
    `✅ Navbar sticky dengan logo dan menu`,
    `✅ Footer dengan hak cipta dan link penting`,
    ``,
    `Hasilkan kod HTML yang PRODUCTION-READY, indah, dan berfungsi penuh.`
  ].join('\n');
}

// Export template list for UI
function getTemplatesByCategory() {
  const cats = {};
  Object.entries(BUSINESS_TEMPLATES).forEach(([key, val]) => {
    if (!cats[val.category]) cats[val.category] = [];
    cats[val.category].push({ key, ...val });
  });
  return cats;
}
