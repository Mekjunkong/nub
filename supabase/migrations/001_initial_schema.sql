-- =============================================
-- Nub Platform - Initial Schema Migration
-- =============================================

-- ===== ENUMS =====

CREATE TYPE employment_type AS ENUM ('government', 'private', 'freelance');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
CREATE TYPE plan_type AS ENUM ('retirement', 'withdrawal', 'stress_test', 'mpt', 'dca', 'tax');
CREATE TYPE fund_category AS ENUM ('equity', 'bond', 'gold', 'mixed', 'money_market');
CREATE TYPE blog_category AS ENUM ('retirement', 'investing', 'tax', 'lifestyle', 'course');
CREATE TYPE booking_type AS ENUM ('contact', 'priority');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE forum_category AS ENUM ('retirement', 'investing', 'tax', 'general');
CREATE TYPE forum_status AS ENUM ('active', 'hidden', 'deleted');
CREATE TYPE notification_type AS ENUM ('market_alert', 'plan_reminder', 'milestone', 'system');
CREATE TYPE calendar_event_type AS ENUM ('tax_deadline', 'ssf_rmf', 'gpf', 'general');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');
CREATE TYPE referral_status AS ENUM ('pending', 'signed_up', 'converted');
CREATE TYPE vote_target_type AS ENUM ('post', 'reply');
CREATE TYPE glossary_category AS ENUM ('retirement', 'investing', 'tax', 'insurance', 'general');
CREATE TYPE language AS ENUM ('th', 'en');

-- ===== HELPER FUNCTION =====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== TABLE 1: profiles =====

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  employment_type employment_type,
  language language NOT NULL DEFAULT 'th',
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  role user_role NOT NULL DEFAULT 'user',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  financial_health_score INTEGER CHECK (financial_health_score >= 0 AND financial_health_score <= 100),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== TABLE 2: saved_plans =====

CREATE TABLE saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  name TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES saved_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_saved_plans_updated_at
  BEFORE UPDATE ON saved_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 3: blog_posts =====

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_th TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category blog_category NOT NULL,
  cover_image_url TEXT,
  seo_description_th TEXT,
  seo_description_en TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 4: funds =====

CREATE TABLE funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category fund_category NOT NULL,
  expected_return NUMERIC NOT NULL,
  standard_deviation NUMERIC NOT NULL,
  roic_current NUMERIC,
  roic_history JSONB,
  nav_history JSONB,
  affiliate_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url TEXT
);

CREATE TRIGGER set_funds_updated_at
  BEFORE UPDATE ON funds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 5: fund_correlations =====

CREATE TABLE fund_correlations (
  fund_a_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  fund_b_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  correlation NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (fund_a_id, fund_b_id)
);

-- ===== TABLE 6: bookings =====

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_type booking_type NOT NULL,
  message TEXT NOT NULL,
  preferred_date DATE,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 7: forum_posts =====

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category forum_category NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  status forum_status NOT NULL DEFAULT 'active',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 8: forum_replies =====

CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  status forum_status NOT NULL DEFAULT 'active',
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== TABLE 9: forum_votes =====

CREATE TABLE forum_votes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type vote_target_type NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, target_type, target_id)
);

-- ===== TABLE 10: notifications =====

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_th TEXT NOT NULL,
  body_en TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- ===== TABLE 11: referrals =====

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  status referral_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- ===== TABLE 12: chat_history =====

CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role chat_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== TABLE 13: glossary_terms =====

CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  term_th TEXT NOT NULL,
  term_en TEXT NOT NULL,
  definition_th TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  category glossary_category NOT NULL,
  related_terms UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_glossary_terms_updated_at
  BEFORE UPDATE ON glossary_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE 14: calendar_events =====

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  event_type calendar_event_type NOT NULL,
  event_date DATE NOT NULL,
  recurring_yearly BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== TABLE 15: chat_daily_usage =====

CREATE TABLE chat_daily_usage (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

-- ===== INDEXES =====

CREATE INDEX idx_saved_plans_user_id ON saved_plans(user_id);
CREATE INDEX idx_saved_plans_plan_type ON saved_plans(plan_type);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_funds_ticker ON funds(ticker);
CREATE INDEX idx_funds_category ON funds(category);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_glossary_terms_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_daily_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Saved plans: users can CRUD own plans
CREATE POLICY "Users can view own plans"
  ON saved_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON saved_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON saved_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON saved_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Blog posts: readable by all authenticated, writable by admins
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Funds: readable by all authenticated
CREATE POLICY "Anyone can read funds"
  ON funds FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage funds"
  ON funds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fund correlations: readable by all
CREATE POLICY "Anyone can read fund correlations"
  ON fund_correlations FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage fund correlations"
  ON fund_correlations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookings: users can CRUD own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Forum posts: readable by all, writable by owner, moderatable by admin
CREATE POLICY "Anyone can read active forum posts"
  ON forum_posts FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forum posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate forum posts"
  ON forum_posts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own forum posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Forum replies: same pattern as posts
CREATE POLICY "Anyone can read active forum replies"
  ON forum_replies FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create forum replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forum replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate forum replies"
  ON forum_replies FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Forum votes: users can manage own votes
CREATE POLICY "Users can view own votes"
  ON forum_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create votes"
  ON forum_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON forum_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications: users can read/update own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Referrals: users can view own
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Chat history: users can CRUD own
CREATE POLICY "Users can view own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Glossary terms: readable by all
CREATE POLICY "Anyone can read glossary terms"
  ON glossary_terms FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage glossary terms"
  ON glossary_terms FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Calendar events: readable by all
CREATE POLICY "Anyone can read calendar events"
  ON calendar_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage calendar events"
  ON calendar_events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Chat daily usage: users can view/update own
CREATE POLICY "Users can view own chat usage"
  ON chat_daily_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat usage"
  ON chat_daily_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat usage"
  ON chat_daily_usage FOR UPDATE
  USING (auth.uid() = user_id);
