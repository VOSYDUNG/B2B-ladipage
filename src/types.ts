export type LeadStatus =
  | 'NEW'
  | 'CONTACT_PENDING'
  | 'WORKING'
  | 'QUALIFIED'
  | 'ORDER_PENDING'
  | 'WON'
  | 'LOST'
  | 'INVALID'
  | 'SALES_ASSIGNED'
  | 'CONTACTED'
  | 'CONVERTED';

export interface UnifiedLead {
  id: string;
  created_at: string;
  updated_at: string;
  
  attribution?: {
    landing_id?: string;
    landing_version?: number;
    campaign_id?: string;
    template_id?: string;
    variant_id?: string;
    language?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    referrer?: string;
    lead_type?: string;
  };

  form?: {
    contract_id?: string;
    form_id?: string;
    version_number?: number;
    schema_hash?: string;
    flow_key?: string;
    runtime_binding?: string;
    binding_mode?: 'explicit' | 'server_inferred_legacy';
  };
  
  identity?: {
    pharmacy_name?: string;
    contact_name?: string;
    phone?: string;
    province?: string;
  };
  
  selection?: {
    package_id?: string;
    reward_option?: string;
    selected_package_value?: number;
    currency?: string;
    items?: OrderItem[];
    need_type?: string;
  };

  compliance?: {
    contact_basis?: 'explicit_consent' | 'user_initiated_service_request';
    contact_consent?: boolean;
    marketing_consent?: boolean;
    privacy_version?: string;
  };
  
  crm?: {
    status?: LeadStatus;
    owner_id?: string | null;
    next_action_at?: string | null;
    lead_score?: number;
    lost_reason?: string | null;
    converted_order_value?: number | null;
    notes?: string;
  };

  // Legacy flat fields for backward compatibility during transition
  pharmacy_name?: string;
  contact_name?: string;
  phone_number?: string;
  province?: string;
  selected_combo?: string;
  display_reward_preference?: string;
  status?: LeadStatus | string;
  owner_id?: string;
  estimated_value?: number;
  lost_reason?: string;
  conversion_reason?: string;
  landing_variant?: string;
  landing_id?: string;
  campaign_id?: string;
  language?: string;
  utm_source?: string;
  utm_medium?: string;
  lead_type?: string;
  role?: string;
  category_interest?: string;
  product_interests?: string[];
  answers_json?: string;
  purchase_intent_range?: string;
  support_needs?: string[];
  preferred_contact?: string;
  referral_code_used?: string;
  referral_code_owned?: string;
  wheel_reward_id?: string;
  wheel_reward_name?: string;
  wheel_reward_issued_at?: string;
  wheel_reward_recorded_at?: string;
  wheel_reward_status?: 'provisional' | 'approved';
  whatsapp_click_at?: string;
  whatsapp_click_count?: number;
}

export interface LeadActivity {
  id?: string;
  lead_id: string;
  type: string;
  note?: string | null;
  actor_id: string;
  actor_role?: string;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}

export interface LandingDailyStat {
  id: string;
  date: string;
  landing_id: string;
  campaign_id: string;
  total_leads: number;
  lead_type_counts: Record<string, number>;
  flow_counts?: Record<string, number>;
  source_counts: Record<string, number>;
  updated_at: string;
}

export interface LandingAnalyticsSummary {
  landing_id: string;
  sessions: number;
  active_users: number;
  page_views: number;
  scroll_75: number;
  form_starts: number;
  generated_leads: number;
  conversion_rate: number | null;
  scroll_75_rate: number | null;
}

export interface LandingAnalyticsSnapshot {
  contract_version: 'landing_analytics_v1';
  source: 'ga4_data_api';
  generated_at: string;
  date_from: string;
  date_to: string;
  landing_filter: string | null;
  freshness: {
    latest_complete_date: string;
    cache_ttl_seconds: number;
  };
  coverage: {
    missing_required_dimensions: string[];
    available_optional_dimensions: string[];
    available_optional_metrics: string[];
    median_dwell_available: boolean;
    median_dwell_note: string;
  };
  summaries: LandingAnalyticsSummary[];
  trend: Array<{
    date: string;
    landing_id: string;
    sessions: number;
    active_users: number;
    page_views: number;
    generated_leads: number;
    form_starts: number;
  }>;
  sections: Array<{
    landing_id: string;
    section_id: string;
    active_users: number;
    event_count: number;
    average_dwell_ms: number | null;
  }>;
  sources: Array<{
    landing_id: string;
    source_medium: string;
    sessions: number;
    active_users: number;
  }>;
  devices: Array<{
    landing_id: string;
    device_category: string;
    sessions: number;
  }>;
  variants: Array<{
    landing_id: string;
    variant_id: string;
    event_count: number;
    generated_leads: number;
  }>;
  cache?: {
    hit: boolean;
    ttl_seconds: number;
  };
}

export interface AiLeadFeature {
  lead_id: string;
  created_at: string;
  landing_id: string;
  landing_version?: number;
  campaign_id: string;
  template_id?: string;
  variant_id?: string;
  language?: string;
  source?: string | null;
  medium?: string | null;
  lead_type?: string;
  form_id?: string;
  form_version?: number;
  flow_key?: string;
  contact_basis?: string;
  province?: string;
  phone_present?: boolean;
  selection?: {
    package_id?: string | null;
    item_count?: number;
    total_quantity?: number;
    need_type?: string | null;
    selected_package_value?: number | null;
    currency?: string | null;
  };
  crm_status?: LeadStatus;
}

export type WebhookDeliveryStatus =
  | 'held'
  | 'pending'
  | 'leased'
  | 'retry_wait'
  | 'delivered'
  | 'dead_letter';

export interface WebhookDelivery {
  deliveryId: string;
  eventId: string;
  destinationId: string;
  contractVersion: 'redacted_lead_event_v1';
  leadFeatureId?: string | null;
  eventType: 'lead.created' | 'lead.crm_updated' | 'lead.deleted';
  landingId: string;
  campaignId: string;
  status: WebhookDeliveryStatus;
  attemptCount: number;
  projectionSha256: string;
  nextAttemptAt?: string | null;
  leaseExpiresAt?: string | null;
  lastHttpStatus?: number | null;
  lastErrorCode?: string | null;
  failureReason?: string | null;
  releasedBy?: string | null;
  releasedAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface WebhookDeliveryAttempt {
  attemptId: string;
  attemptNumber: number;
  startedAt?: string | null;
  completedAt?: string | null;
  outcome: 'delivered' | 'retry_scheduled' | 'dead_letter';
  httpStatus?: number | null;
  errorCode?: string | null;
  responseBodyStored: false;
}

export interface WebhookDeliveryActivity {
  activityId: string;
  type: 'delivery_released' | 'delivery_manual_retry';
  actorId?: string | null;
  actorRole?: string | null;
  previousStatus?: WebhookDeliveryStatus | null;
  newStatus?: WebhookDeliveryStatus | null;
  note?: string | null;
  createdAt?: string | null;
}

export interface WebhookDeliveryDetail {
  delivery: WebhookDelivery;
  attempts: WebhookDeliveryAttempt[];
  activities: WebhookDeliveryActivity[];
}

export interface DeliveryDailyStat {
  statId: string;
  date: string;
  destinationId: string;
  releasedEvents: number;
  attempts: number;
  deliveredEvents: number;
  retryScheduled: number;
  deadLetterEvents: number;
  deliveryLatencySumMs: number;
}

export interface LeadIntegrationWorkspace {
  destination: {
    destinationId: string;
    contractVersion: 'redacted_lead_event_v1';
    deliveryMode: 'off' | 'enabled';
    configured: boolean;
    urlFingerprint?: string | null;
  };
  deliveries: WebhookDelivery[];
  dailyStats: DeliveryDailyStat[];
  health: {
    held: number;
    pending: number;
    retryWait: number;
    deadLetter: number;
    deliveredToday: number;
    oldestActionableAt?: string | null;
  };
  permissions: { canOperate: boolean };
  limit: number;
  truncated: boolean;
  nextCursor?: string | null;
}

export type CrmRole =
  | 'Admin'
  | 'Marketing Manager'
  | 'Sales Rep'
  | 'Regulatory'
  | 'Analyst'
  | 'Display Reviewer';

export interface CrmUserSession {
  uid: string;
  email: string;
  role: CrmRole;
  claimRole?: string;
}

export interface TradeCombo {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  description: string;
  benefits: string[];
  recommendFor: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: string;
  params: Record<string, any>;
}

export type AppLanguage = 'lo' | 'vi' | 'en';

export type LandingVariant = 'safe' | 'medical-preview'

export type LeadFormValues = {
  pharmacyName: string
  province: string
  contactName: string
  phone: string
  selectedPackage: 'basic' | 'advanced'
  rewardOption: 'product' | 'cash' | 'undecided'
  consent: boolean
}

export interface OrderItem {
  product_id: string
  quantity: number
}

export interface PublicLeadPayload {
  form: {
    form_id: string;
    version_number: number;
  };
  attribution: {
    landing_id: string;
    landing_version: number;
    campaign_id: string;
    template_id: string;
    variant_id: string;
    language: string;
    source: string;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    referrer?: string | null;
    lead_type: string;
  };
  identity: {
    pharmacy_name: string;
    province: string;
    contact_name: string;
    phone: string;
  };
  selection: {
    package_id?: string;
    reward_option?: string;
    selected_package_value?: number;
    currency?: string;
    items?: OrderItem[];
    need_type?: string;
  };
  crm: {
    status: 'NEW';
    owner_id: null;
    next_action_at: null;
    lead_score: number | null;
    lost_reason: null;
    converted_order_value: null;
  };
  compliance: {
    contact_consent: boolean;
    privacy_version: string;
  };
  role?: string;
  category_interest?: string;
  product_interests?: string[];
  answers_json?: string;
  purchase_intent_range?: string;
  support_needs?: string[];
  preferred_contact?: string;
  referral_code_used?: string;
  referral_code_owned?: string;
  wheel_reward_id?: string;
  wheel_reward_name?: string;
  wheel_reward_issued_at?: string;
  wheel_reward_recorded_at?: string;
  wheel_reward_status?: 'provisional' | 'approved';
  whatsapp_click_at?: string;
  whatsapp_click_count?: number;
}

export type WhiteLotusOrderValues = {
  pharmacyName: string
  province: string
  contactName: string
  phone: string
  items: OrderItem[]
  consent: boolean
}
