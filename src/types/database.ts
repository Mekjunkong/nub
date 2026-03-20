// ===== Enums =====

export type EmploymentType = "government" | "private" | "freelance";
export type SubscriptionTier = "free" | "premium";
export type PlanType =
  | "retirement"
  | "withdrawal"
  | "stress_test"
  | "mpt"
  | "dca"
  | "tax"
  | "cashflow"
  | "roic"
  | "gpf_optimizer"
  | "tipp"
  | "portfolio_health"
  | "bumnan95"
  | "inflation"
  | "social_security"
  | "insurance"
  | "debt_payoff"
  | "education";
export type FundCategory =
  | "equity"
  | "bond"
  | "gold"
  | "mixed"
  | "money_market";
export type BlogCategory =
  | "retirement"
  | "investing"
  | "tax"
  | "lifestyle"
  | "course";
export type BookingType = "contact" | "priority";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type ForumCategory = "retirement" | "investing" | "tax" | "general";
export type ForumStatus = "active" | "hidden" | "deleted";
export type NotificationType =
  | "market_alert"
  | "plan_reminder"
  | "milestone"
  | "system";
export type CalendarEventType = "tax_deadline" | "ssf_rmf" | "gpf" | "general";
export type UserRole = "user" | "admin";
export type ChatRole = "user" | "assistant";
export type ReferralStatus = "pending" | "signed_up" | "converted";
export type VoteTargetType = "post" | "reply";
export type GlossaryCategory =
  | "retirement"
  | "investing"
  | "tax"
  | "insurance"
  | "general";
export type Language = "th" | "en";
export type ScenarioLabel = "optimistic" | "base" | "conservative";

// ===== Table Row Types =====

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  employment_type: EmploymentType | null;
  language: Language;
  dark_mode: boolean;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  financial_health_score: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPlan {
  id: string;
  user_id: string;
  plan_type: PlanType;
  name: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  is_favorite: boolean;
  version: number;
  parent_version_id: string | null;
  scenario_label: ScenarioLabel | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  category: BlogCategory;
  cover_image_url: string | null;
  seo_description_th: string | null;
  seo_description_en: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Fund {
  id: string;
  ticker: string;
  name_th: string;
  name_en: string;
  category: FundCategory;
  expected_return: number;
  standard_deviation: number;
  roic_current: number | null;
  roic_history: Record<string, number> | null;
  nav_history: Record<string, number> | null;
  affiliate_url: string | null;
  updated_at: string;
  source_url: string | null;
}

export interface FundCorrelation {
  fund_a_id: string;
  fund_b_id: string;
  correlation: number;
  computed_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_type: BookingType;
  message: string;
  preferred_date: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  category: ForumCategory;
  title: string;
  content: string;
  upvotes: number;
  status: ForumStatus;
  is_pinned: boolean;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  status: ForumStatus;
  is_reported: boolean;
  created_at: string;
}

export interface ForumVote {
  user_id: string;
  target_type: VoteTargetType;
  target_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title_th: string;
  title_en: string;
  body_th: string;
  body_en: string;
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  status: ReferralStatus;
  created_at: string;
  converted_at: string | null;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface GlossaryTerm {
  id: string;
  slug: string;
  term_th: string;
  term_en: string;
  definition_th: string;
  definition_en: string;
  category: GlossaryCategory;
  related_terms: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
  event_type: CalendarEventType;
  event_date: string;
  recurring_yearly: boolean;
  created_at: string;
}

export interface ChatDailyUsage {
  user_id: string;
  usage_date: string;
  message_count: number;
}

export type CashflowDirection = "income" | "expense" | "saving" | "investment";
export type CashflowCategory =
  | "salary" | "overtime" | "bonus" | "allowance"
  | "insurance_life" | "insurance_health" | "insurance_pension"
  | "rmf" | "ssf" | "pvd" | "gpf" | "tesg"
  | "personal" | "family" | "transport" | "education"
  | "travel" | "housing" | "debt" | "donation" | "other";

export interface CashflowTemplate {
  id: string;
  user_id: string;
  name: string;
  direction: CashflowDirection;
  category: CashflowCategory;
  amount: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface CashflowTransaction {
  id: string;
  user_id: string;
  template_id: string | null;
  direction: CashflowDirection;
  category: CashflowCategory;
  name: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export type WealthPillarType = "emergency" | "education" | "retirement" | "insurance";

export interface InsurancePolicyRow {
  name: string;
  type: "wholelife" | "saving" | "annuity" | "term" | "critical_illness" | "health";
  death_benefit: number;
  ci_coverage: number;
  surrender_value: number;
  annual_premium: number;
}

export interface WealthPillarRow {
  id: string;
  user_id: string;
  pillar_type: WealthPillarType;
  balance: number | null;
  monthly_expenses: number | null;
  goal_amount: number | null;
  current_amount: number | null;
  target_date: string | null;
  gpf_value: number | null;
  rmf_value: number | null;
  other_retirement: number | null;
  target_corpus: number | null;
  policies: InsurancePolicyRow[] | null;
  updated_at: string;
}

// ===== Database Type (Supabase compatible) =====

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      saved_plans: {
        Row: SavedPlan;
        Insert: Omit<SavedPlan, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<SavedPlan>;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<BlogPost>;
        Relationships: [];
      };
      funds: {
        Row: Fund;
        Insert: Omit<Fund, "id" | "updated_at"> & { id?: string };
        Update: Partial<Fund>;
        Relationships: [];
      };
      fund_correlations: {
        Row: FundCorrelation;
        Insert: FundCorrelation;
        Update: Partial<FundCorrelation>;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Booking>;
        Relationships: [];
      };
      forum_posts: {
        Row: ForumPost;
        Insert: Omit<ForumPost, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<ForumPost>;
        Relationships: [];
      };
      forum_replies: {
        Row: ForumReply;
        Insert: Omit<ForumReply, "id" | "created_at"> & { id?: string };
        Update: Partial<ForumReply>;
        Relationships: [];
      };
      forum_votes: {
        Row: ForumVote;
        Insert: ForumVote;
        Update: Partial<ForumVote>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at"> & { id?: string };
        Update: Partial<Notification>;
        Relationships: [];
      };
      referrals: {
        Row: Referral;
        Insert: Omit<Referral, "id" | "created_at"> & { id?: string };
        Update: Partial<Referral>;
        Relationships: [];
      };
      chat_history: {
        Row: ChatHistory;
        Insert: Omit<ChatHistory, "id" | "created_at"> & { id?: string };
        Update: Partial<ChatHistory>;
        Relationships: [];
      };
      glossary_terms: {
        Row: GlossaryTerm;
        Insert: Omit<GlossaryTerm, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<GlossaryTerm>;
        Relationships: [];
      };
      calendar_events: {
        Row: CalendarEvent;
        Insert: Omit<CalendarEvent, "id" | "created_at"> & { id?: string };
        Update: Partial<CalendarEvent>;
        Relationships: [];
      };
      chat_daily_usage: {
        Row: ChatDailyUsage;
        Insert: ChatDailyUsage;
        Update: Partial<ChatDailyUsage>;
        Relationships: [];
      };
      cashflow_templates: {
        Row: CashflowTemplate;
        Insert: Omit<CashflowTemplate, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<CashflowTemplate>;
        Relationships: [];
      };
      cashflow_transactions: {
        Row: CashflowTransaction;
        Insert: Omit<CashflowTransaction, "id" | "created_at"> & { id?: string };
        Update: Partial<CashflowTransaction>;
        Relationships: [];
      };
      wealth_pillars: {
        Row: WealthPillarRow;
        Insert: Omit<WealthPillarRow, "id" | "updated_at"> & { id?: string };
        Update: Partial<WealthPillarRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      employment_type: EmploymentType;
      subscription_tier: SubscriptionTier;
      plan_type: PlanType;
      fund_category: FundCategory;
      blog_category: BlogCategory;
      booking_type: BookingType;
      booking_status: BookingStatus;
      forum_category: ForumCategory;
      forum_status: ForumStatus;
      notification_type: NotificationType;
      calendar_event_type: CalendarEventType;
      user_role: UserRole;
      chat_role: ChatRole;
      referral_status: ReferralStatus;
      vote_target_type: VoteTargetType;
      glossary_category: GlossaryCategory;
      language: Language;
      cashflow_direction: CashflowDirection;
      cashflow_category: CashflowCategory;
    };
  };
}
