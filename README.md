# Prompt Generator — Project Structure & Contribution Guide

## Overview
Prompt Generator is a web-based application for generating, saving, and managing business prompts, with user authentication, subscription management, and affiliate features. It uses Supabase for backend (auth, database, storage) and is designed for easy contribution and scalability.

---

## Project Structure

```
root/
│
├── admin.html              # Admin dashboard (HTML)
├── affiliate.html          # Affiliate dashboard (HTML)
├── dashboard.html          # Main user dashboard (HTML)
├── generator.html          # Prompt generator UI (HTML)
├── index.html              # Landing page (HTML)
├── login.html              # Login & registration (HTML)
├── pricing.html            # Pricing & plans (HTML)
├── saved-prompts.html      # Saved prompts UI (HTML)
│
├── css/
│   └── style.css           # Main stylesheet
│
├── js/
│   ├── affiliate.js        # Affiliate logic (Supabase)
│   ├── auth.js             # Authentication (Supabase)
│   ├── generator.js        # Prompt generation logic
│   ├── storage.js          # CRUD for prompts (Supabase)
│   ├── subscription.js     # Subscription/plan logic
│   ├── supabase-config.js  # Supabase client config
│   └── utils.js            # Shared UI utilities
│
├── supabase-schema.sql     # Supabase DB schema & policies
├── package.json            # NPM dependencies (Supabase JS)
├── vercel.json             # Vercel deployment config
├── test-save.js            # Test: prompt save logic
├── test-supabase.js        # Test: Supabase connection
└── .gitignore              # Git ignore rules
```

---

## Key Technologies
- **Frontend:** HTML, CSS, Vanilla JS
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Deployment:** Vercel
- **Dependencies:** @supabase/supabase-js

---

## How to Contribute
1. **Fork & Clone** this repo.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Supabase:**
   - Update `js/supabase-config.js` with your Supabase URL & anon key if needed.
   - Use `supabase-schema.sql` to set up your database.
4. **Development:**
   - Edit HTML/JS/CSS files as needed.
   - Use `test-save.js` and `test-supabase.js` for local testing.
5. **Pull Requests:**
   - Follow code style in `js/utils.js`.
   - Write clear commit messages.
   - Describe your changes in PRs.

---

## Scaling & Best Practices
- **Modular JS:** Each feature in its own file under `js/`.
- **Supabase:** Use RLS & policies for security (see `supabase-schema.sql`).
- **UI:** Keep UI logic in `utils.js` for reuse.
- **Testing:** Use test files for DB and logic validation.
- **Docs:** Update this README and add comments in code.

---

## License
MIT
