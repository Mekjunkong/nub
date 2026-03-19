-- =============================================
-- Batch 1: Cashflow Tracker, Wealth Pillars, ROIC
-- =============================================

-- ===== ENUMS =====

CREATE TYPE cashflow_direction AS ENUM ('income', 'expense', 'saving', 'investment');
CREATE TYPE cashflow_category AS ENUM (
  'salary', 'overtime', 'bonus', 'allowance',
  'insurance_life', 'insurance_health', 'insurance_pension',
  'rmf', 'ssf', 'pvd', 'gpf', 'tesg',
  'personal', 'family', 'transport', 'education',
  'travel', 'housing', 'debt', 'donation', 'other'
);

-- ===== Extend plan_type =====
-- Batch 1 types
ALTER TYPE plan_type ADD VALUE 'cashflow';
ALTER TYPE plan_type ADD VALUE 'roic';
-- Forward declarations for Batch 2/3 (no pages/logic yet)
ALTER TYPE plan_type ADD VALUE 'gpf_optimizer';
ALTER TYPE plan_type ADD VALUE 'tipp';
ALTER TYPE plan_type ADD VALUE 'portfolio_health';
ALTER TYPE plan_type ADD VALUE 'bumnan95';

-- ===== TABLE: cashflow_templates =====

CREATE TABLE cashflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  direction cashflow_direction NOT NULL,
  category cashflow_category NOT NULL,
  amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_cashflow_templates_updated_at
  BEFORE UPDATE ON cashflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== TABLE: cashflow_transactions =====

CREATE TABLE cashflow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES cashflow_templates(id) ON DELETE SET NULL,
  direction cashflow_direction NOT NULL,
  category cashflow_category NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== TABLE: wealth_pillars =====

CREATE TABLE wealth_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('emergency', 'education', 'retirement', 'insurance')),
  balance NUMERIC,
  monthly_expenses NUMERIC,
  goal_amount NUMERIC,
  current_amount NUMERIC,
  target_date DATE,
  gpf_value NUMERIC,
  rmf_value NUMERIC,
  other_retirement NUMERIC,
  target_corpus NUMERIC,
  policies JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pillar_type),
  CHECK (pillar_type != 'emergency' OR (balance IS NOT NULL AND monthly_expenses IS NOT NULL)),
  CHECK (pillar_type != 'education' OR (goal_amount IS NOT NULL AND current_amount IS NOT NULL)),
  CHECK (pillar_type != 'retirement' OR target_corpus IS NOT NULL),
  CHECK (pillar_type != 'insurance' OR policies IS NOT NULL)
);

CREATE TRIGGER set_wealth_pillars_updated_at
  BEFORE UPDATE ON wealth_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== INDEXES =====

CREATE INDEX idx_cashflow_templates_user ON cashflow_templates(user_id);
CREATE INDEX idx_cashflow_transactions_user_period ON cashflow_transactions(user_id, year, month);

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE cashflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON cashflow_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own templates"
  ON cashflow_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates"
  ON cashflow_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates"
  ON cashflow_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON cashflow_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions"
  ON cashflow_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"
  ON cashflow_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON cashflow_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pillars"
  ON wealth_pillars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pillars"
  ON wealth_pillars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pillars"
  ON wealth_pillars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pillars"
  ON wealth_pillars FOR DELETE USING (auth.uid() = user_id);
