// ===================================================
// generator.js — Prompt generation logic & templates
// ===================================================

const BUSINESS_TEMPLATES = {
  // ── MAKANAN & MINUMAN ──────────────────────────
  restaurant : { 
    label:'🍜 Restoran / Kedai Makan', icon:'🍜', category:'Makanan', tone:'Kasual & Mesra', 
    sections:['Menu Pilihan','Galeri Makanan','Reservasi Online','Ulasan Pelanggan','Lokasi & Hubungi'],
    fields: [
      { id:'cuisine', label:'Jenis Masakan', type:'text', placeholder:'Melayu, Thai, Barat, Fusion...' },
      { id:'specialty', label:'Menu Signatur (Wajib Cuba)', type:'text', placeholder:'Nasi Lemak Pandan, Shellout...' },
      { id:'vibe', label:'Suasana Kedai', type:'text', placeholder:'Santai keluarga, candle light, open-air...' }
    ]
  },
  cafe : { 
    label:'☕ Kafe / Kedai Kopi', icon:'☕', category:'Makanan', tone:'Santai & Trendy',
    sections:['Menu Minuman','Ruang Santai','Wifi & Fasiliti','Acara Khas','Galeri'],
    fields: [
      { id:'coffee_beans', label:'Jenis Kopi/Biji Kopi', type:'text', placeholder:'Arabica, Robusta, Local Brew...' },
      { id:'pastries', label:'Pilihan Pastri/Kek', type:'text', placeholder:'Croissant, Burnt Cheesecake...' },
      { id:'working_friendly', label:'Kemudahan Bekerja', type:'text', placeholder:'Ada plug point, wifi laju, aircond...' }
    ]
  },
  bakery : { 
    label:'🍰 Kedai Kek & Bakeri', icon:'🍰', category:'Makanan', tone:'Hangat & Manis',
    sections:['Katalog Produk','Tempahan Khas','Penghantaran','Testimoni'],
    fields: [
      { id:'cake_types', label:'Kategori Kek', type:'text', placeholder:'Wedding cake, birthday cake, brownies...' },
      { id:'ingredients', label:'Kelebihan Bahan', type:'text', placeholder:'Pure butter, kurang manis, gluten-free...' }
    ]
  },
  foodtruck : { 
    label:'🚐 Food Truck', icon:'🚐', category:'Makanan', tone:'Kasual & Meriah',
    sections:['Menu','Lokasi Harian','Cara Pesan','Galeri'],
    fields: [
      { id:'truck_locations', label:'Lokasi Operasi', type:'text', placeholder:'Taman Melawati, Tapak Urban Street Dining...' },
      { id:'speed_service', label:'Kepantasan Servis', type:'text', placeholder:'Siap dalam 5 minit, grab & go...' }
    ]
  },

  // ── FESYEN & PAKAIAN ───────────────────────────
  fashion : { 
    label:'👗 Butik / Fesyen', icon:'👗', category:'Fesyen', tone:'Mewah & Bergaya',
    sections:['Koleksi Terbaru','Lookbook','Panduan Saiz','Cara Beli'],
    fields: [
      { id:'style_type', label:'Gaya Pakaian', type:'text', placeholder:'Streetwear, Office wear, Casual...' },
      { id:'material', label:'Jenis Kain/Material', type:'text', placeholder:'Cotton, Silk, Premium Linen...' }
    ]
  },
  hijab : { 
    label:'🧕 Butik Hijab & Tudung', icon:'🧕', category:'Fesyen', tone:'Elegan & Sopan',
    sections:['Koleksi','Tutorial Pakai','Testimoni','Kedai Online'],
    fields: [
      { id:'hijab_type', label:'Jenis Tudung', type:'text', placeholder:'Bawal, Shawl, Instant, Khimar...' },
      { id:'collection_name', label:'Nama Koleksi Terbaru', type:'text', placeholder:'Raya 2024, Seri Pagi...' }
    ]
  },
  kids : { 
    label:'👶 Pakaian Kanak-kanak', icon:'👶', category:'Fesyen', tone:'Ceria & Selamat',
    sections:['Koleksi','Panduan Umur','Promosi','Hubungi'],
    fields: [
      { id:'age_range', label:'Peringkat Umur', type:'text', placeholder:'Newborn - 12 tahun, baby gear...' },
      { id:'comfort', label:'Kelebihan Keselesaan', type:'text', placeholder:'100% Organic Cotton, tak gatal...' }
    ]
  },

  // ── KECANTIKAN & KESIHATAN ─────────────────────
  salon : { 
    label:'💇 Salon / Barbershop', icon:'💇', category:'Kecantikan', tone:'Profesional & Trendy',
    sections:['Perkhidmatan','Harga','Galeri','Tempah Temujanji'],
    fields: [
      { id:'services', label:'Servis Utama', type:'text', placeholder:'Hair coloring, treatment, perming...' },
      { id:'stylist_exp', label:'Pengalaman Stylist', type:'text', placeholder:'10 tahun dalam industri, pakar mewarna...' }
    ]
  },
  spa : { 
    label:'💆 Spa & Wellness', icon:'💆', category:'Kecantikan', tone:'Tenang & Mewah',
    sections:['Rawatan','Pakej','Galeri','Tempahan'],
    fields: [
      { id:'spa_treatments', label:'Jenis Rawatan', type:'text', placeholder:'Urutan tradisional, facial, body scrub...' },
      { id:'aromatherapy', label:'Bau/Aroma', type:'text', placeholder:'Lavender, Lemongrass, Sandalwood...' }
    ]
  },
  skincare : { 
    label:'✨ Produk Skincare', icon:'✨', category:'Kecantikan', tone:'Bersih & Saintifik',
    sections:['Produk','Bahan-bahan','Cara Guna','Sebelum & Selepas'],
    fields: [
      { id:'skin_problem', label:'Masalah Kulit Fokus', type:'text', placeholder:'Jerawat, jeragat, kulit kering...' },
      { id:'hero_ingredient', label:'Bahan Utama (Hero)', type:'text', placeholder:'Retinol, Vitamin C, Habbatus Sauda...' }
    ]
  },
  gym : { 
    label:'💪 Gym / Fitness', icon:'💪', category:'Kecantikan', tone:'Energi & Motivasi',
    sections:['Program','Jurulatih','Harga Keahlian','Kemudahan'],
    fields: [
      { id:'gym_type', label:'Jenis Gym', type:'text', placeholder:'Ladies only, 24-hours, CrossFit box...' },
      { id:'membership_perks', label:'Kelebihan Ahli', type:'text', placeholder:'Free personal trainer trial, shower, sauna...' }
    ]
  },

  // ── PENDIDIKAN ────────────────────────────────
  tuition : { 
    label:'📚 Pusat Tuisyen', icon:'📚', category:'Pendidikan', tone:'Profesional & Mesra',
    sections:['Program','Guru Kami','Jadual','Daftar'],
    fields: [
      { id:'subjects', label:'Subjek Ditawarkan', type:'text', placeholder:'Matematik, Sains, BM, Sejarah...' },
      { id:'levels', label:'Tahap Pendidikan', type:'text', placeholder:'UPSR, PT3, SPM, IGCSE...' }
    ]
  },
  onlineCourse : { 
    label:'🎓 Kursus Online', icon:'🎓', category:'Pendidikan', tone:'Motivasi & Profesional',
    sections:['Kursus','Kurikulum','Pengajar','Harga & Daftar'],
    fields: [
      { id:'learning_platform', label:'Platform Pembelajaran', type:'text', placeholder:'Zoom, Website sendiri, Mobile App...' },
      { id:'course_benefit', label:'Apa Pelajar Dapat?', type:'text', placeholder:'Sijil, Lifetime access, Support group...' }
    ]
  },
  kindergarten : { 
    label:'🏫 Tadika / Prasekolah', icon:'🏫', category:'Pendidikan', tone:'Ceria & Mesra',
    sections:['Program','Aktiviti','Kemudahan','Pendaftaran'],
    fields: [
      { id:'curriculum', label:'Silibus/Kurikulum', type:'text', placeholder:'Montessori, Islamic Integrated, KSPK...' },
      { id:'operating_hours', label:'Waktu Operasi', type:'text', placeholder:'7:30 AM - 6:00 PM...' }
    ]
  },

  // ── PERKHIDMATAN PROFESIONAL ──────────────────
  contractor : { 
    label:'🏗️ Kontraktor / Pembinaan', icon:'🏗️', category:'Profesional', tone:'Dipercayai & Kuat',
    sections:['Perkhidmatan','Portfolio','Testimoni','Sebutharga'],
    fields: [
      { id:'construction_type', label:'Jenis Kerja', type:'text', placeholder:'Renovasi rumah, bina baru, wiring...' },
      { id:'cidb', label:'Lesen/Gred CIDB', type:'text', placeholder:'Gred G3, Berdaftar dengan CIDB...' }
    ]
  },
  accounting : { 
    label:'📊 Perakaunan / Cukai', icon:'📊', category:'Profesional', tone:'Profesional',
    sections:['Perkhidmatan','Pakej','FAQ','Hubungi'],
    fields: [
      { id:'acc_services', label:'Jenis Servis', type:'text', placeholder:'Audit, Tax filing, Bookkeeping...' },
      { id:'client_focus', label:'Fokus Klien', type:'text', placeholder:'SME, Enterprise, Self-employed...' }
    ]
  },
  legal : { 
    label:'⚖️ Firma Guaman', icon:'⚖️', category:'Profesional', tone:'Authoriti & Formal',
    sections:['Bidang Amalan','Peguam','Kes Berjaya','Konsultasi'],
    fields: [
      { id:'practice_area', label:'Bidang Utama', type:'text', placeholder:'Hartanah, Syariah, Jenayah, Korporat...' },
      { id:'legal_team', label:'Ketua Peguam', type:'text', placeholder:'Dato Ariff & Co, 20 tahun pengalaman...' }
    ]
  },
  insurance : { 
    label:'🛡️ Insurans / Takaful', icon:'🛡️', category:'Profesional', tone:'Amanah & Selamat',
    sections:['Produk','Kalkulator','Ejen','Hubungi'],
    fields: [
      { id:'agency_name', label:'Syarikat Utama', type:'text', placeholder:'Prudential, AIA, Great Eastern, Etiqa...' },
      { id:'plan_focus', label:'Fokus Pelan', type:'text', placeholder:'Kad Medikal, Hibah, Pendidikan...' }
    ]
  },

  // ── HARTANAH & PENGINAPAN ─────────────────────
  homestay : { 
    label:'🏡 Homestay / Inap Desa', icon:'🏡', category:'Hartanah', tone:'Selesa & Mesra',
    sections:['Galeri Gambar','Kemudahan','Kadar Sewaan','Peraturan','Lokasi'],
    fields: [
      { id:'capacity', label:'Kapasiti Maksimum', type:'text', placeholder:'10 orang, 3 bilik tidur...' },
      { id:'amenities', label:'Kemudahan Utama', type:'text', placeholder:'Kolam renang, BBQ pit, Wifi, Netflix...' }
    ]
  },
  rumahSewa : { 
    label:'🔑 Rumah Sewa', icon:'🔑', category:'Hartanah', tone:'Dipercayai & Terang',
    sections:['Maklumat Hartanah','Gambar','Kemudahan','Syarat Sewaan','Hubungi'],
    fields: [
      { id:'property_specs', label:'Spesifikasi Rumah', type:'text', placeholder:'3 Bilik 2 Bilik Air, Fully Furnished...' },
      { id:'rental_rate', label:'Kadar Sewa & Deposit', type:'text', placeholder:'RM1000/bulan, Deposit 2+1...' }
    ]
  },
  property : { 
    label:'🏠 Ejen Hartanah', icon:'🏠', category:'Hartanah', tone:'Profesional & Amanah',
    sections:['Senarai Properti','Ejen','Kalkulator','Hubungi'],
    fields: [
      { id:'property_type', label:'Jenis Hartanah', type:'text', placeholder:'Condo, Terrace, Land, Commercial...' },
      { id:'location_focus', label:'Kawasan Fokus', type:'text', placeholder:'KLCC, Shah Alam, Cyberjaya...' },
      { id:'price_range', label:'Julat Harga', type:'text', placeholder:'RM300k - RM1M...' }
    ]
  },
  propDev : { 
    label:'Pemaju Hartanah', icon:'🏢', category:'Hartanah', tone:'Mewah & Eksklusif',
    sections:['Projek','Konsep','Kemudahan','Daftar Minat'],
    fields: [
      { id:'project_status', label:'Status Projek', type:'text', placeholder:'Pre-launch, Under-construction, Ready to move...' },
      { id:'unique_selling', label:'Kelebihan Projek', type:'text', placeholder:'Freehold, Smart home system, Private lift...' }
    ]
  },

  // ── AUTOMOTIF ─────────────────────────────────
  workshop : { 
    label:'🔧 Bengkel / Workshop', icon:'🔧', category:'Automotif', tone:'Dipercayai & Teknikal',
    sections:['Perkhidmatan','Harga','Testimoni','Lokasi'],
    fields: [
      { id:'car_brands', label:'Jenama Kereta', type:'text', placeholder:'Perodua, Proton, European, Luxury...' },
      { id:'workshop_specialty', label:'Pakar Dalam', type:'text', placeholder:'Overhaul, Gearbox, Aircond, Painting...' }
    ]
  },
  carRental : { 
    label:'🚗 Sewa Kereta', icon:'🚗', category:'Automotif', tone:'Mudah & Fleksibel',
    sections:['Armada','Pakej','Cara Tempah','Terma'],
    fields: [
      { id:'fleet_types', label:'Jenis Kereta', type:'text', placeholder:'Axia, Saga, Vellfire, Luxury sports...' },
      { id:'delivery_service', label:'Penghantaran', type:'text', placeholder:'Airport delivery, Doorstep, Self-pickup...' }
    ]
  },

  // ── TEKNOLOGI ────────────────────────────────
  itService : { 
    label:'💻 Perkhidmatan IT', icon:'💻', category:'Teknologi', tone:'Moden & Inovatif',
    sections:['Perkhidmatan','Teknologi','Portfolio','Hubungi'],
    fields: [
      { id:'it_focus', label:'Fokus Servis', type:'text', placeholder:'Cybersecurity, Cloud migration, Hardware repair...' },
      { id:'response_time', label:'Masa Respons', type:'text', placeholder:'Support 24/7, Dalam masa 2 jam...' }
    ]
  },
  webDesign : { 
    label:'🎨 Web Design / Dev', icon:'🎨', category:'Teknologi', tone:'Kreatif & Profesional',
    sections:['Portfolio','Perkhidmatan','Proses','Harga'],
    fields: [
      { id:'tech_stack', label:'Teknologi Digunakan', type:'text', placeholder:'React, WordPress, Shopify, Next.js...' },
      { id:'industries', label:'Industri Fokus', type:'text', placeholder:'E-commerce, Corporate, Startup...' }
    ]
  },
  app : { 
    label:'📱 Pembangunan Aplikasi', icon:'📱', category:'Teknologi', tone:'Inovatif & Moden',
    sections:['Perkhidmatan','Portfolio','Proses','Pakej'],
    fields: [
      { id:'app_platform', label:'Platform App', type:'text', placeholder:'iOS & Android (Hybrid), Native, Web App...' },
      { id:'dev_process', label:'Proses Dev', type:'text', placeholder:'Agile development, 3-6 bulan jangka masa...' }
    ]
  },

  // ── ACARA & HIBURAN ───────────────────────────
  event : { 
    label:'🎉 Penganjur Acara', icon:'🎉', category:'Acara', tone:'Meriah & Kreatif',
    sections:['Perkhidmatan','Portfolio','Pakej','Tempah'],
    fields: [
      { id:'event_type', label:'Jenis Acara', type:'text', placeholder:'Wedding, Corporate dinner, Birthday party...' },
      { id:'vendor_network', label:'Rangkaian Vendor', type:'text', placeholder:'Catering, Sound & light, Emcee sedia ada...' }
    ]
  },
  photography : { 
    label:'📷 Fotografi / Videografi', icon:'📷', category:'Acara', tone:'Artistik & Profesional',
    sections:['Portfolio','Pakej','Cara Tempah','Hubungi'],
    fields: [
      { id:'shoot_style', label:'Gaya Rakaman', type:'text', placeholder:'Cinematic, Candid, High-fashion, Vintage...' },
      { id:'delivery_time', label:'Tempoh Siap', type:'text', placeholder:'Edit dalam 2 minggu, Raw files dlm 24 jam...' }
    ]
  },

  // ── LOGISTIK ─────────────────────────────────
  logistics : { 
    label:'🚚 Logistik / Penghantaran', icon:'🚚', category:'Logistik', tone:'Pantas & Dipercayai',
    sections:['Perkhidmatan','Zon Penghantaran','Harga','Track'],
    fields: [
      { id:'vehicle_types', label:'Jenis Kenderaan', type:'text', placeholder:'Van, 3-ton lorry, Cold chain truck...' },
      { id:'safety_guarantee', label:'Jaminan Keselamatan', type:'text', placeholder:'Insurans barang, Real-time tracking...' }
    ]
  },

  // ── E-COMMERCE ───────────────────────────────
  ecommerce : { 
    label:'🛒 E-Commerce Umum', icon:'🛒', category:'E-Commerce', tone:'Moden & Mesra',
    sections:['Produk','Kategori','Cara Beli','FAQ'],
    fields: [
      { id:'product_niche', label:'Niche Produk', type:'text', placeholder:'Gadget, Home decor, Pet supplies...' },
      { id:'payment_gateways', label:'Sistem Bayaran', type:'text', placeholder:'FPX, Credit Card, ShopeePay, GrabPay...' }
    ]
  },

  // ── DIGITAL CARDS ─────────────────────────────
  weddingCard : { 
    label:'💍 Kad Kawin Digital', icon:'💍', category:'Kad Digital', tone:'Romantik & Elegan',
    sections:['Mempelai','Aturcara','Peta Lokasi','RSVP','Galeri Gambar','Ucapan'],
    fields: [
      { id:'bride_groom', label:'Nama Pengantin', type:'text', placeholder:'Ali & Fatimah...' },
      { id:'wedding_date', label:'Tarikh Majlis', type:'date', placeholder:'' },
      { id:'theme', label:'Tema Warna/Majlis', type:'text', placeholder:'Pastel, Garden, Songket...' }
    ]
  },
  businessCard : { 
    label:'📇 Kad Bisnes Digital', icon:'📇', category:'Kad Digital', tone:'Profesional & Moden',
    sections:['Profil','Hubungi','Social Media','vCard','Portfolio'],
    fields: [
      { id:'job_title', label:'Jawatan/Role', type:'text', placeholder:'CEO & Founder, Senior Consultant...' },
      { id:'vcard_perk', label:'Kelebihan vCard', type:'text', placeholder:'Simpan terus ke fon dalam satu klik...' }
    ]
  }
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
    buildProductSection(formData),
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
    `MAKLUMAT PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Nama Perniagaan   : ${d.businessName || '-'}`,
    `Jenis Perniagaan  : ${tpl.label || '-'}`,
    d.location ? `Lokasi            : ${d.location}` : ''
  ];

  // Tambah info khusus perniagaan jika ada
  if (tpl.fields) {
    tpl.fields.forEach(f => {
      const val = d[f.id];
      if (val) {
        lines.push(`${f.label.padEnd(18)}: ${val}`);
      }
    });
  }

  lines.push(
    ``,
    `PENERANGAN:`,
    d.description || '(tiada penerangan)',
    ``,
    `KHALAYAK SASARAN:`,
    d.targetAudience || '(umum)',
    ``,
    `KELEBIHAN UNIK (USP):`,
    d.usp || '(tidak dinyatakan)'
  );

  // Tambah Galeri Imej jika ada
  if (d.images && d.images.length > 0) {
    lines.push(
      ``,
      `GALERI IMEJ UNTUK DIGUNAKAN:`,
      ...d.images.map((img, i) => `${i+1}. ${img}`)
    );
  }

  return lines.filter(l => l !== null).join('\n');
}

function buildProductSection(d) {
  if (!d.products || d.products.length === 0) return '';
  
  const lines = [
    `═══════════════════════════════════════════════════════`,
    `KATALOG PRODUK / PERKHIDMATAN`,
    `═══════════════════════════════════════════════════════`,
    `Sila bina grid produk yang menarik dengan butang "Order WhatsApp" untuk setiap produk:`,
    ``
  ];

  d.products.forEach((p, i) => {
    lines.push(`Produk #${i+1}:`);
    lines.push(`- Nama: ${p.name}`);
    lines.push(`- Harga: RM ${p.price || 'Sila tentukan'}`);
    if (p.desc) lines.push(`- Penerangan: ${p.desc}`);
    lines.push(``);
  });

  return lines.join('\n');
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
    homestay   : `- Galeri gambar bilik dan kemudahan (kolam renang, ruang tamu, dapur dll)\n- Senarai lengkap kemudahan yang disediakan\n- Jadual harga / kadar sewa\n- Peraturan homestay (House rules)\n- Peta lokasi dan tempat menarik berhampiran\n- Butang tempah sekarang (WhatsApp/form)`,
    rumahSewa  : `- Maklumat spesifikasi rumah (bilik, keluasan, perabot)\n- Galeri gambar keadaan rumah terkini\n- Senarai kemudahan berdekatan (sekolah, kedai, LRT)\n- Maklumat harga sewa dan deposit\n- Terma dan syarat sewaan\n- Butang hubungi pemilik/ejen (WhatsApp)`,
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

  let extra = '';
  if (d.extraFeatures && d.extraFeatures.length > 0) {
    extra = `\nCiri-ciri Tambahan yang Diminta:\n` + d.extraFeatures.map(f => {
      return `  ✦ ${f.name}\n    Spesifikasi: ${f.detail}`;
    }).join('\n');
  }

  // Tambah info QR jika ada
  let qrNote = '';
  if (d.qrInfo && d.qrInfo.url) {
    qrNote = `\n\nARAHAN PEMBAYARAN:\n- Sila sertakan bahagian pembayaran menggunakan QR Code (${d.qrInfo.type || 'Pilihan'})\n- URL Gambar QR: ${d.qrInfo.url}`;
  }

  return [
    `═══════════════════════════════════════════════════════`,
    `CIRI KHUSUS JENIS PERNIAGAAN`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Bahagian yang MESTI ada:`,
    sections,
    ``,
    `Arahan Khusus:`,
    specific,
    extra,
    qrNote
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
    `FORMAT OUTPUT & ARAHAN PENTING`,
    `═══════════════════════════════════════════════════════`,
    ``,
    `Berikan SATU fail HTML yang LENGKAP dengan:`,
    `1. Semua CSS dalam tag <style> di dalam <head>`,
    `2. Semua JavaScript dalam tag <script> sebelum </body>`,
    `3. TIADA fail luaran kecuali CDN (Google Fonts, Font Awesome)`,
    ``,
    `PENTING — Pastikan:`,
    `- WhatsApp link: https://wa.me/${(d.contact?.whatsapp||'601XXXXXXXX').replace(/\D/g,'')}`,
    `- Semua butang CTA menonjol dan mendorong tindakan`,
    `- Landing page boleh "convert" (ada clear value proposition)`,
    `- Kod LENGKAP, bukan sebahagian atau placeholder`,
    `- Responsif sempurna pada mobile (320px - 428px)`,
    `- Navbar sticky dengan logo dan menu`,
    `- Footer dengan hak cipta dan link penting`,
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
