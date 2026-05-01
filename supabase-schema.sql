-- =====================================================
-- SUPABASE SCHEMA untuk PromptBiz Pro
-- Jalankan SQL ini di Supabase SQL Editor
-- =====================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  business_type VARCHAR(50),
  plan VARCHAR(20) DEFAULT 'free',
  plan_billing_cycle VARCHAR(10) DEFAULT 'monthly',
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  ai_credits_left INTEGER DEFAULT 5,
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  affiliate_code VARCHAR(20) UNIQUE,
  affiliate_enabled BOOLEAN DEFAULT false,
  affiliate_balance DECIMAL(10,2) DEFAULT 0,
  affiliate_total_earned DECIMAL(10,2) DEFAULT 0,
  referred_by UUID REFERENCES public.profiles(id),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROMPTS
CREATE TABLE public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  business_type_label VARCHAR(100),
  form_data JSONB DEFAULT '{}'::jsonb,
  generated_prompt TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favourite BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(10) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  promo_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  payment_method VARCHAR(30),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROMO CODES
CREATE TABLE public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AFFILIATE EARNINGS
CREATE TABLE public.affiliate_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL DEFAULT 0.30,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AFFILIATE CLICKS
CREATE TABLE public.affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(20) NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WITHDRAWALS
CREATE TABLE public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  bank_name VARCHAR(50),
  account_number VARCHAR(30),
  account_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 8. RATE LIMIT LOG (for tracking rate limits)
CREATE TABLE public.rate_limit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email VARCHAR(255),
  ip VARCHAR(45),
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes for rate limit check performance
CREATE INDEX idx_rate_limit_key ON public.rate_limit_log(key, timestamp DESC);
CREATE INDEX idx_rate_limit_action ON public.rate_limit_log(action, timestamp DESC);
CREATE INDEX idx_rate_limit_email ON public.rate_limit_log(email, timestamp DESC);
CREATE INDEX idx_rate_limit_ip ON public.rate_limit_log(ip, timestamp DESC);

-- Auto-cleanup old rate limit records (>24 hours old)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_log()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limit_log 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT is_admin FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read/update own profile; admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  public.is_admin()
);

-- PROMPTS: users can CRUD own prompts
CREATE POLICY "Users can view own prompts" ON public.prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prompts" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all prompts" ON public.prompts FOR SELECT USING (
  public.is_admin()
);

-- SUBSCRIPTIONS
CREATE POLICY "Users can view own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subs" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all subs" ON public.subscriptions FOR SELECT USING (
  public.is_admin()
);

-- PROMO CODES: anyone can read active codes
CREATE POLICY "Anyone can view active promos" ON public.promo_codes FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage promos" ON public.promo_codes FOR ALL USING (
  public.is_admin()
);

-- AFFILIATE EARNINGS
CREATE POLICY "Users can view own earnings" ON public.affiliate_earnings FOR SELECT USING (auth.uid() = affiliate_id);
CREATE POLICY "Admins can manage earnings" ON public.affiliate_earnings FOR ALL USING (
  public.is_admin()
);

-- AFFILIATE CLICKS
CREATE POLICY "Users can view own clicks" ON public.affiliate_clicks FOR SELECT USING (auth.uid() = affiliate_id);
CREATE POLICY "Anyone can insert clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);

-- WITHDRAWALS
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage withdrawals" ON public.withdrawals FOR ALL USING (
  public.is_admin()
);

-- =====================================================
-- FUNCTION: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED: Default promo codes
-- =====================================================
INSERT INTO public.promo_codes (code, type, value, max_uses, description) VALUES
  ('MULAKAN30', 'percentage', 30, 100, '30% diskaun untuk pengguna baru'),
  ('JIMAT50', 'fixed', 50, 50, 'RM50 off untuk pelan Pro'),
  ('AGENSI2025', 'percentage', 20, NULL, '20% off untuk pelan Agency');

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_affiliate_earnings_affiliate_id ON public.affiliate_earnings(affiliate_id);
CREATE INDEX idx_profiles_affiliate_code ON public.profiles(affiliate_code);
