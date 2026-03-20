-- ============================================================
-- Migration 003: Notifications triggers + scenario support
-- ============================================================

-- 1. Scenario label enum and column
DO $$ BEGIN
  CREATE TYPE scenario_label AS ENUM ('optimistic', 'base', 'conservative');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE saved_plans ADD COLUMN IF NOT EXISTS scenario_label scenario_label;

-- 2. Health score target on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS financial_health_score_target float;

-- 3. Notification trigger: on plan save
CREATE OR REPLACE FUNCTION notify_plan_saved()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title_th, title_en, body_th, body_en, read)
  VALUES (
    NEW.user_id,
    'plan_reminder',
    'บันทึกแผนสำเร็จ',
    'Plan Saved',
    'แผน "' || COALESCE(NEW.name, 'Unnamed') || '" ถูกบันทึกแล้ว',
    'Your plan "' || COALESCE(NEW.name, 'Unnamed') || '" has been saved.',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS trg_plan_saved ON saved_plans;
CREATE TRIGGER trg_plan_saved
  AFTER INSERT ON saved_plans
  FOR EACH ROW EXECUTE FUNCTION notify_plan_saved();

-- 4. Notification trigger: on health score significant change (>= 10 points)
CREATE OR REPLACE FUNCTION notify_score_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.financial_health_score IS NOT NULL
     AND NEW.financial_health_score IS NOT NULL
     AND abs(NEW.financial_health_score - OLD.financial_health_score) >= 10
  THEN
    INSERT INTO notifications (user_id, type, title_th, title_en, body_th, body_en, read)
    VALUES (
      NEW.id,
      'milestone',
      'คะแนนสุขภาพการเงินเปลี่ยนแปลง',
      'Health Score Changed',
      'คะแนนของคุณเปลี่ยนจาก ' || OLD.financial_health_score || ' เป็น ' || NEW.financial_health_score,
      'Your score changed from ' || OLD.financial_health_score || ' to ' || NEW.financial_health_score,
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_score_change ON profiles;
CREATE TRIGGER trg_score_change
  AFTER UPDATE OF financial_health_score ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_score_change();
