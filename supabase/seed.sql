-- ===== Seed Data for Nub Platform =====

-- Sample Funds
INSERT INTO funds (id, ticker, name_th, name_en, category, expected_return, standard_deviation, source_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'SCBRMS&P500', 'กองทุนเปิดไทยพาณิชย์หุ้นยูเอส S&P500', 'SCB US Equity S&P 500 Fund', 'equity', 0.08, 0.1858, 'https://www.scbam.com'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'SCBRM2', 'กองทุนเปิดไทยพาณิชย์ตราสารหนี้ระยะสั้น', 'SCB Short-term Fixed Income Fund', 'bond', 0.025, 0.0191, 'https://www.scbam.com'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'SCBRMGOLDH', 'กองทุนเปิดไทยพาณิชย์โกลด์ THB เฮดจ์', 'SCB Gold THB Hedged Fund', 'gold', 0.05, 0.1511, 'https://www.scbam.com');

-- Fund Correlations (from spreadsheet)
INSERT INTO fund_correlations (fund_a_id, fund_b_id, correlation) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 0.1496),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 0.1432),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0003-4000-8000-000000000003', 0.0978);

-- Glossary Terms
INSERT INTO glossary_terms (slug, term_th, term_en, definition_th, definition_en, category) VALUES
  ('monte-carlo', 'มอนติคาร์โล', 'Monte Carlo Simulation', 'วิธีการจำลองทางสถิติที่ใช้ตัวเลขสุ่มจำนวนมากเพื่อประมาณผลลัพธ์ที่เป็นไปได้ของระบบที่มีความไม่แน่นอน ในการวางแผนการเงิน ใช้เพื่อจำลองสถานการณ์ตลาดนับพันครั้งเพื่อประเมินความน่าจะเป็นที่เงินจะเพียงพอตลอดวัยเกษียณ', 'A statistical simulation method that uses large numbers of random samples to estimate possible outcomes of uncertain systems. In financial planning, it simulates thousands of market scenarios to assess the probability that money will last throughout retirement.', 'investing'),
  ('roic', 'อัตราผลตอบแทนจากเงินลงทุน', 'ROIC (Return on Invested Capital)', 'อัตราส่วนทางการเงินที่วัดความสามารถในการสร้างผลกำไรจากเงินทุนทั้งหมดที่ลงทุนในกองทุน คำนวณจาก (มูลค่าปัจจุบัน - เงินลงทุน) / เงินลงทุน', 'A financial ratio measuring how effectively a fund generates returns from total capital invested. Calculated as (Current Value - Investment) / Investment.', 'investing'),
  ('sharpe-ratio', 'อัตราส่วนชาร์ป', 'Sharpe Ratio', 'อัตราส่วนที่วัดผลตอบแทนส่วนเกินต่อหน่วยความเสี่ยง คำนวณจาก (ผลตอบแทนพอร์ต - อัตราปลอดความเสี่ยง) / ส่วนเบี่ยงเบนมาตรฐาน ค่ายิ่งสูงยิ่งดี', 'A ratio measuring excess return per unit of risk. Calculated as (Portfolio Return - Risk-free Rate) / Standard Deviation. Higher values indicate better risk-adjusted returns.', 'investing'),
  ('gpf', 'กบข.', 'Government Pension Fund (GPF)', 'กองทุนบำเหน็จบำนาญข้าราชการ เป็นกองทุนสำรองเลี้ยงชีพภาคบังคับสำหรับข้าราชการไทย สมาชิกจ่ายเงินสมทบ 3% ของเงินเดือน และรัฐบาลสมทบเพิ่มอีก 3% พร้อมเงินชดเชย 2% และเงินประเดิม 2%', 'Government Pension Fund for Thai civil servants. Members contribute 3% of salary, with government matching 3% plus 2% compensation and 2% initial contribution.', 'retirement'),
  ('pvd', 'กองทุนสำรองเลี้ยงชีพ', 'Provident Fund (PVD)', 'กองทุนออมเพื่อการเกษียณภาคสมัครใจสำหรับพนักงานเอกชน นายจ้างและลูกจ้างจ่ายสมทบร่วมกัน อัตราสมทบขึ้นอยู่กับนโยบายบริษัท (ปกติ 3-15% ของเงินเดือน)', 'A voluntary retirement savings fund for private sector employees. Both employer and employee contribute. Contribution rates depend on company policy (typically 3-15% of salary).', 'retirement');

-- Calendar Events
INSERT INTO calendar_events (title_th, title_en, description_th, description_en, event_type, event_date, recurring_yearly) VALUES
  ('วันสุดท้ายยื่นภาษีเงินได้บุคคลธรรมดา', 'Personal Income Tax Filing Deadline', 'วันสุดท้ายสำหรับยื่นแบบ ภ.ง.ด. 90/91 ประจำปี', 'Last day to file PND 90/91 annual tax return', 'tax_deadline', '2026-03-31', TRUE),
  ('วันสุดท้ายซื้อ SSF/RMF เพื่อลดหย่อนภาษี', 'SSF/RMF Tax Deduction Purchase Deadline', 'วันสุดท้ายสำหรับซื้อกองทุน SSF และ RMF เพื่อใช้สิทธิ์ลดหย่อนภาษีประจำปี', 'Last day to purchase SSF and RMF funds for annual tax deduction benefits', 'ssf_rmf', '2026-12-30', TRUE),
  ('วันจ่ายเงินสมทบ กบข. งวดสุดท้าย', 'Last GPF Contribution Period', 'งวดสุดท้ายของการจ่ายเงินสมทบ กบข. ประจำปี สำหรับข้าราชการ', 'Final GPF contribution period of the year for government officials', 'gpf', '2026-12-25', TRUE);
