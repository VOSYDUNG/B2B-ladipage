import React, { useEffect, useRef, useState } from 'react';
import {
  UnifiedLead,
  AppLanguage,
  AnalyticsEvent,
  LeadStatus,
  LeadActivity,
  CrmUserSession,
  LandingDailyStat,
  AiLeadFeature,
  LandingAnalyticsSnapshot,
  LeadIntegrationWorkspace,
  WebhookDeliveryDetail
} from '../types';
import type {
  AssetReplacementJob,
  LandingClaim,
  LandingAsset,
  LandingFormDefinition,
  LandingRegistryEntry,
  LandingVersion,
  LandingWorkspacePermissions,
} from '@/config/landing-registry';
import type { AssetUploadPhase, LandingCommand } from '@/lib/admin-landing-service';
import type { IntegrationFilters } from '@/lib/admin-integration-service';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { 
  Search, MapPin, Package, Award, User, Phone, CheckCircle2, RefreshCw, 
  AlertCircle, Trash2, Download, Eye, LogOut, ShieldAlert, BarChart3, Database,
  Layers, Check, X, FileText, ChevronRight, Settings, Sliders, TrendingUp,
  Calendar, Filter, KanbanSquare, CheckSquare, Zap, Clock, Save, Edit, Info, LayoutDashboard,
  BrainCircuit, Copy, GitBranch, RotateCcw, Send, ShieldCheck, ImageIcon,
  Upload, Loader2, ExternalLink, Users, Gift
} from 'lucide-react';

const LeadDeliveryOperations = React.lazy(() => (
  import('@/components/LeadDeliveryOperations').then((module) => ({
    default: module.LeadDeliveryOperations,
  }))
));

type FirestoreLoadState = 'idle' | 'loading' | 'ready' | 'error';
type AnalyticsApiState = FirestoreLoadState | 'unavailable';

interface B2BCrmDashboardProps {
  leads: UnifiedLead[];
  leadActivities?: LeadActivity[];
  landingStats?: LandingDailyStat[];
  landingAnalytics?: LandingAnalyticsSnapshot | null;
  analyticsApiState?: AnalyticsApiState;
  analyticsApiError?: string | null;
  leadLoadState?: FirestoreLoadState;
  statsLoadState?: FirestoreLoadState;
  statsTruncated?: boolean;
  leadReadLimit?: number;
  onLoadAiLeadFeature?: (leadId: string) => Promise<AiLeadFeature | null>;
  landingPages?: LandingRegistryEntry[];
  landingVersions?: LandingVersion[];
  landingForms?: LandingFormDefinition[];
  landingClaims?: LandingClaim[];
  landingAssets?: LandingAsset[];
  assetReplacementJobs?: AssetReplacementJob[];
  landingPermissions?: LandingWorkspacePermissions;
  landingRegistrySource?: 'api' | 'fallback' | 'error';
  integrationWorkspace?: LeadIntegrationWorkspace | null;
  integrationLoadState?: FirestoreLoadState;
  onSelectLanding?: (landingId: string) => Promise<boolean>;
  onLandingCommand?: (
    command: LandingCommand
  ) => Promise<{ ok: boolean; error?: string }>;
  onUploadAssetReplacement?: (
    assetId: string,
    file: File,
    onPhase?: (phase: AssetUploadPhase) => void
  ) => Promise<{ ok: boolean; error?: string }>;
  onFinalizeAssetReplacement?: (
    jobId: string
  ) => Promise<{ ok: boolean; error?: string }>;
  onReviewAssetReplacement?: (
    jobId: string,
    decision: 'approved' | 'rejected',
    note?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  onRefreshIntegration?: (filters?: IntegrationFilters) => Promise<boolean>;
  onIntegrationCommand?: (
    action: 'release_delivery' | 'retry_delivery',
    deliveryId: string,
    note: string
  ) => Promise<{ ok: boolean; error?: string }>;
  onLoadDeliveryDetail?: (deliveryId: string) => Promise<WebhookDeliveryDetail | null>;
  onUpdateLead?: (id: string, updatedFields: Partial<UnifiedLead>) => void;
  onDeleteLead?: (id: string) => void;
  readOnlyMode?: boolean;
  lang: AppLanguage;
  currentUser: CrmUserSession | null;
  onLogout: () => void;
  analyticsEvents: AnalyticsEvent[];
  onClearLogs: () => void;
}

const CRM_DICT = {
  lo: {
    title: "NNC Laos CRM - ລະບົບຈັດການຂໍ້ມູນຮ້ານຂາຍຢາ B2B",
    subtitle: "ຕິດຕາມ ແລະ ແບ່ງປັນລີດ (Leads) ໃຫ້ທີມຂາຍ (Sales reps) ຫຼັງການລົງທະບຽນ",
    totalLeads: "ລວມລີດທັງໝົດ",
    expectedRevenue: "ມູນຄ່າຍອດຂາຍຄາດຄະເນ (LAK)",
    rewardPref: "ຮູບແບບລາງວັນທີ່ມັກ",
    rewardCash: "ເງິນສົດ (CASH)",
    rewardProduct: "ຜະລິດຕະພັນ (IN_KIND)",
    rewardNone: "ບໍ່ເລືອກ",
    provinceStats: "ສະຖິຕິຕາມແຂວງ",
    searchPlaceholder: "ຄົ້ນຫາຊື່ຮ້ານຂາຍຢາ, ເບີໂທ, ຜູ້ຕິດຕໍ່...",
    tablePharmacy: "ຮ້ານຂາຍຢາ",
    tableContact: "ຜູ້ຕິດຕໍ່/ເບີໂທ",
    tableProvince: "ແຂວງ",
    tableCombo: "ແພັກເກັດ/ຂອງແຖມ",
    tableStatus: "ສະຖານະ",
    tableActions: "ການຈັດການ",
    btnChangeStatus: "ປ່ຽນສະຖານະ",
    statusNew: "ໃໝ່ (NEW)",
    statusSales: "ມອບໝາຍທີມຂາຍ (SALES ASSIGNED)",
    statusContacted: "ຕິດຕໍ່ແລ້ວ (CONTACTED)",
    statusConverted: "ປິດການຂາຍ (CONVERTED)",
    noLeads: "ບໍ່ມີຂໍ້ມູນການລົງທະບຽນເທື່ອ. ກະລຸນາຕື່ມຟອມໃນໜ້າ Landing Page ເພື່ອທົດສອບ.",
    exportCsv: "ສົ່ງອອກຂໍ້ມູນ CSV",
    deleteConfirm: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລີດນີ້?",
    logout: "ອອກຈາກລະບົບ",
    roleLabel: "ບົດບາດສິດທິ:",
    admin: "ຜູ້ບໍລິຫານສູງສຸດ",
    manager: "ຜູ້ຈັດການການຕະຫຼາດ",
    sales: "ຕົວແທນຝ່າຍຂາຍ (MR)",
    noPermissionTitle: "ບໍ່ມີສິດເຂົ້າເຖິງ",
    noPermissionDesc: "ສິດທິລະດັບ Sales Rep ບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ເຂົ້າເຖິງຂໍ້ມູນລາຍງານການຕະຫຼາດ.",
    salesLimitWarning: "ທ່ານຢູ່ໃນສິດທິ Sales Rep: ບໍ່ສາມາດລຶບ Lead, ສົ່ງອອກ CSV ຫຼື ເບິ່ງ JSON ຕົ້ນສະບັບໄດ້.",
    managerLimitWarning: "ທ່ານຢູ່ໃນສິດທິ Manager: ບໍ່ສາມາດລຶບ Lead ໄດ້ (ມີແຕ່ Admin ເທົ່ານັ້ນ)."
  },
  vi: {
    title: "NNC Laos CRM - Quản Lý Đối Tác Nhà Thuốc B2B",
    subtitle: "Hệ thống theo dõi lead bán hàng và bàn giao cho Trình Dược Viên (Sales Reps) tại Lào",
    totalLeads: "Tổng số đăng ký (Leads)",
    expectedRevenue: "Giá trị đơn hàng dự kiến (LAK)",
    rewardPref: "Ưu đãi trưng bày",
    rewardCash: "Tiền mặt (CASH)",
    rewardProduct: "Sản phẩm sủi (IN_KIND)",
    rewardNone: "Không tham gia",
    provinceStats: "Phân bố địa lý (Tỉnh)",
    searchPlaceholder: "Tìm tên nhà thuốc, số điện thoại, người đại diện...",
    tablePharmacy: "Nhà thuốc",
    tableContact: "Người liên hệ / ĐT",
    tableProvince: "Tỉnh thành",
    tableCombo: "Combo nhập hàng",
    tableStatus: "Trạng thái",
    tableActions: "Hành động",
    btnChangeStatus: "Đổi trạng thái",
    statusNew: "Mới đăng ký",
    statusSales: "Đã giao Trình dược",
    statusContacted: "Đã liên hệ tư vấn",
    statusConverted: "Đã lên đơn thành công",
    noLeads: "Chưa có nhà thuốc nào đăng ký. Hãy điền form đăng ký phía trên để xem dữ liệu hiển thị.",
    exportCsv: "Xuất dữ liệu CSV",
    deleteConfirm: "Bạn có chắc chắn muốn xóa lượt đăng ký này?",
    logout: "Đăng xuất",
    roleLabel: "Quyền hạn:",
    admin: "Quản trị viên tối cao",
    manager: "Quản lý Marketing",
    sales: "Trình dược viên (Sales Rep)",
    noPermissionTitle: "Không Có Quyền Truy Cập",
    noPermissionDesc: "Tài khoản Trình dược viên (Sales Rep) không có quyền xem báo cáo phân tích chiến dịch Marketing.",
    salesLimitWarning: "Chế độ Trình dược viên: Bạn không có quyền Xóa Lead, Xem JSON gốc hoặc Xuất CSV.",
    managerLimitWarning: "Chế độ Quản lý: Bạn không có quyền Xóa dữ liệu (Chỉ dành cho Admin)."
  },
  en: {
    title: "NNC Laos CRM - B2B Pharmacy Lead Panel",
    subtitle: "Track, allocate leads to Sales Reps, and manage trade programs in Laos",
    totalLeads: "Total Registered Leads",
    expectedRevenue: "Expected Sales Value (LAK)",
    rewardPref: "Display Reward Preference",
    rewardCash: "Cash Incentive",
    rewardProduct: "Product Incentive",
    rewardNone: "No preference",
    provinceStats: "Province Distribution",
    searchPlaceholder: "Search pharmacy name, phone, contact...",
    tablePharmacy: "Pharmacy",
    tableContact: "Contact Person / Tel",
    tableProvince: "Province",
    tableCombo: "Combo Level",
    tableStatus: "Status",
    tableActions: "Actions",
    btnChangeStatus: "Change Status",
    statusNew: "New Lead",
    statusSales: "Sales Assigned",
    statusContacted: "Contacted",
    statusConverted: "Converted (Sale Won)",
    noLeads: "No leads registered yet. Please submit the form on the landing page to test this dashboard.",
    exportCsv: "Export to CSV",
    deleteConfirm: "Are you sure you want to delete this lead?",
    logout: "Log Out",
    roleLabel: "Authorized Role:",
    admin: "System Administrator",
    manager: "Marketing Manager",
    sales: "Medical Representative (Sales Rep)",
    noPermissionTitle: "Access Denied",
    noPermissionDesc: "Medical Representatives (Sales Rep) are restricted from viewing macro marketing performance metrics.",
    salesLimitWarning: "Sales Representative Mode: You cannot delete leads, view raw JSON document, or export CSV data.",
    managerLimitWarning: "Marketing Manager Mode: You cannot delete leads (System Admin privilege required)."
  }
};

const PROVINCE_MAP: Record<string, string> = {
  vientiane: "ນະຄອນຫຼວງວຽງຈັນ (Vientiane Capital)",
  savannakhet: "ສະຫວັນນະເຂດ (Savannakhet)",
  champasak: "ຈຳປາສັກ (Champasak)",
  luangprabang: "ຫຼວງພະບາງ (Luang Prabang)",
  khammouane: "ຄຳມ່ວນ (Khammouane)",
  other: "ແຂວງອື່ນໆ (Other Province)"
};

const normalizeStatus = (status?: string): LeadStatus => {
  switch (status) {
    case 'SALES_ASSIGNED':
    case 'CONTACTED':
      return 'WORKING';
    case 'CONVERTED':
      return 'WON';
    case 'CONTACT_PENDING':
    case 'WORKING':
    case 'QUALIFIED':
    case 'ORDER_PENDING':
    case 'WON':
    case 'LOST':
    case 'INVALID':
    case 'NEW':
      return status;
    default:
      return 'NEW';
  }
};

const getLeadStatus = (lead: UnifiedLead): LeadStatus => normalizeStatus(lead.crm?.status || lead.status);
const getLeadLandingId = (lead: UnifiedLead) => lead.attribution?.landing_id || lead.landing_id || 'unknown';
const getLeadCampaignId = (lead: UnifiedLead) => lead.attribution?.campaign_id || lead.campaign_id || (lead as any).utm_campaign || 'N/A';
const getLeadType = (lead: UnifiedLead) => lead.attribution?.lead_type || lead.lead_type || 'ORDER';
const getLeadVariant = (lead: UnifiedLead) => lead.attribution?.variant_id || lead.landing_variant || 'default';
const getLeadSource = (lead: UnifiedLead) => lead.attribution?.source || lead.utm_source || 'direct';
const getLeadMedium = (lead: UnifiedLead) => lead.attribution?.medium || lead.utm_medium || 'none';
const getLeadPackage = (lead: UnifiedLead) => lead.selection?.package_id || lead.selected_combo || '';
const getLeadReward = (lead: UnifiedLead) => lead.selection?.reward_option || lead.display_reward_preference || '';
const getLeadValue = (lead: UnifiedLead) => {
  if (typeof lead.crm?.converted_order_value === 'number') return lead.crm.converted_order_value;
  if (typeof lead.selection?.selected_package_value === 'number') return lead.selection.selected_package_value;
  if (typeof lead.estimated_value === 'number') return lead.estimated_value;
  const combo = getLeadPackage(lead);
  if (combo === 'COMBO_1M' || combo === 'advanced') return 1_000_000;
  if (combo === 'COMBO_500K' || combo === 'basic') return 500_000;
  return 0;
};

const toMetricKey = (value: string) => (
  value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').slice(0, 60) || 'unknown'
);

const matchesDateFilter = (dateValue: string, filterDate: string) => {
  if (filterDate === 'all') return true;
  const date = new Date(`${dateValue}T00:00:00`);
  const now = new Date();
  if (Number.isNaN(date.getTime())) return false;
  if (filterDate === 'today') return date.toDateString() === now.toDateString();
  if (filterDate === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  return true;
};

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const getRecordString = (record: Record<string, unknown> | null | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'string' && value ? value : undefined;
};

const formatLeadActivityLog = (activity: LeadActivity) => {
  const timestamp = activity.created_at ? activity.created_at.slice(0, 16).replace('T', ' ') : 'unknown time';
  const actor = activity.actor_role || activity.actor_id || 'system';
  const summary = activity.note || activity.type.replace(/_/g, ' ');
  const previousStatus = getRecordString(activity.previous_value, 'status');
  const nextStatus = getRecordString(activity.new_value, 'status');
  const previousOwner = getRecordString(activity.previous_value, 'owner_id') || 'unassigned';
  const nextOwner = getRecordString(activity.new_value, 'owner_id') || 'unassigned';
  const previousNextAction = getRecordString(activity.previous_value, 'next_action_at') || 'not set';
  const nextNextAction = getRecordString(activity.new_value, 'next_action_at') || 'not set';

  if (previousStatus && nextStatus && previousStatus !== nextStatus) {
    return `[${timestamp}] ${summary} by ${actor}: status ${previousStatus} -> ${nextStatus}`;
  }

  if (previousOwner !== nextOwner) {
    return `[${timestamp}] ${summary} by ${actor}: owner ${previousOwner} -> ${nextOwner}`;
  }

  if (previousNextAction !== nextNextAction) {
    return `[${timestamp}] ${summary} by ${actor}: next action ${previousNextAction} -> ${nextNextAction}`;
  }

  const previousReward = getRecordString(activity.previous_value, 'wheel_reward_name');
  const nextReward = getRecordString(activity.new_value, 'wheel_reward_name');
  const previousReferral = getRecordString(activity.previous_value, 'referral_code_used');
  const nextReferral = getRecordString(activity.new_value, 'referral_code_used');

  if (previousReward !== nextReward) {
    return `[${timestamp}] ${summary} by ${actor}: wheel reward modified from "${previousReward || 'none'}" to "${nextReward || 'none'}"`;
  }
  if (previousReferral !== nextReferral) {
    return `[${timestamp}] ${summary} by ${actor}: referral code used changed from "${previousReferral || 'none'}" to "${nextReferral || 'none'}"`;
  }

  return `[${timestamp}] ${summary} by ${actor}`;
};

const buildLeadDrawerLogs = (lead: UnifiedLead, leadActivities: LeadActivity[]) => {
  const activityLogs = leadActivities
    .filter(activity => activity.lead_id === lead.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12)
    .map(formatLeadActivityLog);

  if (activityLogs.length > 0) return activityLogs;

  const fallbackLogs = [
    `[${lead.created_at.slice(0,16)}] Lead initialized from page variant "${getLeadVariant(lead)}".`,
    `[${lead.created_at.slice(0,16)}] UTM Source: "${getLeadSource(lead)}", Medium: "${getLeadMedium(lead)}"`
  ];
  if (lead.updated_at && lead.updated_at !== lead.created_at) {
    fallbackLogs.push(`[${lead.updated_at.slice(0,16)}] Status synced as "${getLeadStatus(lead)}".`);
  }
  return fallbackLogs;
};

const formatAssetBytes = (bytes?: number | null) => {
  if (!Number.isFinite(bytes) || !bytes) return '0 B';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${bytes} B`;
};

export default function B2BCrmDashboard({
  leads,
  leadActivities = [],
  landingStats = [],
  landingAnalytics = null,
  analyticsApiState = 'unavailable',
  analyticsApiError = 'Marketing sessions and engagement are reviewed in Firebase Analytics / GA4. This CRM does not proxy the GA4 Data API.',
  leadLoadState = 'idle',
  statsLoadState = 'idle',
  statsTruncated = false,
  leadReadLimit = 500,
  onLoadAiLeadFeature,
  landingPages = [],
  landingVersions = [],
  landingForms = [],
  landingClaims = [],
  landingAssets = [],
  assetReplacementJobs = [],
  landingPermissions = {
    canManage: false,
    canReview: false,
    canViewAnalytics: false,
  },
  landingRegistrySource = 'fallback',
  integrationWorkspace = null,
  integrationLoadState = 'idle',
  onSelectLanding,
  onLandingCommand,
  onUploadAssetReplacement,
  onFinalizeAssetReplacement,
  onReviewAssetReplacement,
  onRefreshIntegration,
  onIntegrationCommand,
  onLoadDeliveryDetail,
  onUpdateLead,
  onDeleteLead,
  readOnlyMode = true,
  lang,
  currentUser,
  onLogout,
  analyticsEvents,
  onClearLogs
}: B2BCrmDashboardProps) {
  const t = CRM_DICT[lang];

  const [activeTab, setActiveTab] = useState<'overview' | 'landings' | 'acquisition' | 'engagement' | 'funnel' | 'leads' | 'pipeline' | 'display' | 'performance' | 'settings'>('leads');

  // Filter States
  const [filterDate, setFilterDate] = useState('all');
  const [filterLanding, setFilterLanding] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterLeadType, setFilterLeadType] = useState('all');
  const [filterVariant, setFilterVariant] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');

  // Leads Search and Drawer States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);

  // Drawer Form fields
  const [drawerStatus, setDrawerStatus] = useState<LeadStatus>('NEW');
  const [drawerOwner, setDrawerOwner] = useState('');
  const [drawerNextAction, setDrawerNextAction] = useState('');
  const [drawerValue, setDrawerValue] = useState(0);
  const [drawerLostReason, setDrawerLostReason] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerRewardOverride, setDrawerRewardOverride] = useState('');
  const [drawerReferralOverride, setDrawerReferralOverride] = useState('');
  const [drawerLogs, setDrawerLogs] = useState<string[]>([]);
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);
  const [leadFeature, setLeadFeature] = useState<AiLeadFeature | null>(null);
  const [leadFeatureState, setLeadFeatureState] = useState<'idle' | 'loading' | 'ready' | 'missing'>('idle');
  const leadFeatureRequest = useRef(0);
  const [landingUpdatePending, setLandingUpdatePending] = useState<string | null>(null);
  const [selectedLandingId, setSelectedLandingId] = useState(
    landingPages[0]?.landingId || ''
  );
  const [landingDetailTab, setLandingDetailTab] = useState<
    'overview' | 'versions' | 'form' | 'assets' | 'claims' | 'referrals' | 'rewards'
  >('overview');
  const [duplicateDraft, setDuplicateDraft] = useState({
    landingId: '',
    name: '',
    campaignId: '',
  });
  const [landingActionError, setLandingActionError] = useState<string | null>(null);
  const [assetOperationPending, setAssetOperationPending] = useState<string | null>(null);
  const [assetOperationPhase, setAssetOperationPhase] = useState<AssetUploadPhase | null>(null);
  const [assetReviewNotes, setAssetReviewNotes] = useState<Record<string, string>>({});

  const landingOptions = landingPages;
  const campaignOptions = Array.from(new Set(landingOptions.map((landing) => landing.campaignId)));
  const getLandingLeadTotal = (landingId: string) => landingStats
    .filter((stat) => stat.landing_id === landingId)
    .reduce((sum, stat) => sum + stat.total_leads, 0);
  const variantOptions = Array.from(new Set([
    'default',
    'safe',
    'medical-preview',
    ...landingOptions.map((landing) => landing.defaultVariant)
  ]));
  const canViewLeadCrm = Boolean(currentUser && [
    'Admin',
    'Marketing Manager',
    'Sales Rep',
  ].includes(currentUser.role));
  const canViewAnalytics = false;
  const canManageLandingPages = landingPermissions.canManage;
  const canReviewLandingPages = landingPermissions.canReview;
  const canViewLandingPages = false;
  const canViewIntegrationOperations = false;
  const selectedLanding = landingPages.find(
    (landing) => landing.landingId === selectedLandingId
  ) || landingPages[0] || null;
  const selectedLandingVersions = selectedLanding
    ? landingVersions.filter((version) => version.landingId === selectedLanding.landingId)
    : [];
  const selectedActiveVersion = selectedLanding
    ? selectedLandingVersions.find(
      (version) => version.versionNumber === selectedLanding.activeVersion
    ) || null
    : null;
  const selectedFormRefs = selectedActiveVersion?.formRefs || selectedLanding?.formRefs || {};
  const selectedLandingForms = selectedLanding
    ? landingForms
      .filter((form) => form.landingId === selectedLanding.landingId)
      .sort((a, b) => a.flowKey.localeCompare(b.flowKey) || b.versionNumber - a.versionNumber)
    : [];
  const activeSourceForms = selectedLandingForms.filter((form) => form.status === 'active');
  const activeFormFlows = Array.from(new Set(activeSourceForms.map((form) => form.flowKey)));
  const formBlockers = activeFormFlows.filter((flowKey) => {
    const boundContractId = selectedFormRefs[flowKey];
    const boundContract = selectedLandingForms.find(
      (form) => form.contractId === boundContractId
    );
    return !boundContract
      || boundContract.status !== 'active'
      || !boundContract.active
      || !boundContract.sourceLocked
      || !boundContract.runtimeReady
      || !boundContract.schemaHash
      || !boundContract.runtimeBinding;
  });
  const formPiiFieldCount = selectedLandingForms.reduce((count, form) => (
    count + form.fields.filter((field) => field.piiClass !== 'non_pii').length
  ), 0);
  const boundFormCount = activeFormFlows.length - formBlockers.length;
  const formsReady = activeFormFlows.length > 0 && formBlockers.length === 0;
  const editableFormVersion = [...selectedLandingVersions]
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .find((version) => ['draft', 'internal_review'].includes(version.status)) || null;
  const relevantClaimIds = new Set(
    selectedLandingVersions.flatMap((version) => version.claimRefs)
  );
  const selectedClaims = landingClaims.filter((claim) => (
    relevantClaimIds.has(claim.claimId)
    || claim.productId.toLowerCase().includes(selectedLanding?.landingId || '__none__')
  ));
  const selectedAssetIds = new Set(
    selectedLandingVersions.flatMap((version) => version.assetRefs)
  );
  const selectedAssets = landingAssets.filter((asset) => (
    asset.landingId === selectedLanding?.landingId
    || selectedAssetIds.has(asset.assetId)
  ));
  const blockedAssets = selectedAssets.filter((asset) => (
    !asset.productionReady
    && asset.publicAccess !== 'hcp_acknowledgement_and_regulatory_review'
  ));
  const selectedAssetReplacementJobs = assetReplacementJobs
    .filter((job) => job.landingId === selectedLanding?.landingId)
    .sort((left, right) => (
      Date.parse(right.createdAt || '') - Date.parse(left.createdAt || '')
    ));
  const pendingAssetJobs = selectedAssetReplacementJobs.filter((job) => (
    job.status === 'upload_pending' || job.status === 'verifying'
  ));
  const verifiedAssetJobs = selectedAssetReplacementJobs.filter((job) => job.status === 'verified');
  const approvedAssetJobs = selectedAssetReplacementJobs.filter(
    (job) => job.status === 'approved_candidate'
  );
  const failedAssetJobs = selectedAssetReplacementJobs.filter((job) => (
    job.status === 'rejected' || job.status === 'verification_failed'
  ));

  useEffect(() => {
    if (!canViewLeadCrm) {
      if (activeTab !== 'settings') setActiveTab('settings');
      return;
    }
    if (!['leads', 'pipeline', 'settings'].includes(activeTab)) setActiveTab('leads');
  }, [
    activeTab,
    canViewLeadCrm,
  ]);

  useEffect(() => {
    if (!selectedLandingId && landingPages[0]) {
      setSelectedLandingId(landingPages[0].landingId);
    }
  }, [landingPages, selectedLandingId]);

  useEffect(() => {
    if (selectedLead) setDrawerLogs(buildLeadDrawerLogs(selectedLead, leadActivities));
  }, [leadActivities, selectedLead]);

  const runLandingCommand = async (command: LandingCommand, pendingKey: string) => {
    if (!onLandingCommand) return false;
    setLandingUpdatePending(pendingKey);
    setLandingActionError(null);
    const result = await onLandingCommand(command);
    setLandingUpdatePending(null);
    if (!result.ok) {
      setLandingActionError(result.error || 'Landing action failed.');
      return false;
    }
    if (selectedLandingId && onSelectLanding) {
      await onSelectLanding(selectedLandingId);
    }
    return true;
  };

  const runAssetUpload = async (assetId: string, file: File) => {
    if (!onUploadAssetReplacement) return;
    setAssetOperationPending(`upload:${assetId}`);
    setAssetOperationPhase('hashing');
    setLandingActionError(null);
    const result = await onUploadAssetReplacement(assetId, file, setAssetOperationPhase);
    setAssetOperationPending(null);
    setAssetOperationPhase(null);
    if (!result.ok) setLandingActionError(result.error || 'Asset upload failed.');
  };

  const runAssetReview = async (
    jobId: string,
    decision: 'approved' | 'rejected'
  ) => {
    if (!onReviewAssetReplacement) return;
    setAssetOperationPending(`review:${jobId}:${decision}`);
    setLandingActionError(null);
    const result = await onReviewAssetReplacement(
      jobId,
      decision,
      assetReviewNotes[jobId]
    );
    setAssetOperationPending(null);
    if (!result.ok) {
      setLandingActionError(result.error || 'Asset review failed.');
      return;
    }
    setAssetReviewNotes((previous) => ({ ...previous, [jobId]: '' }));
  };

  const runAssetFinalize = async (jobId: string) => {
    if (!onFinalizeAssetReplacement) return;
    setAssetOperationPending(`finalize:${jobId}`);
    setAssetOperationPhase('verifying');
    setLandingActionError(null);
    const result = await onFinalizeAssetReplacement(jobId);
    setAssetOperationPending(null);
    setAssetOperationPhase(null);
    if (!result.ok) setLandingActionError(result.error || 'Asset verification failed.');
  };

  const selectLandingWorkspace = async (landingId: string) => {
    setSelectedLandingId(landingId);
    setLandingDetailTab('overview');
    setLandingActionError(null);
    if (!onSelectLanding) return;
    setLandingUpdatePending(`load:${landingId}`);
    const loaded = await onSelectLanding(landingId);
    setLandingUpdatePending(null);
    if (!loaded) setLandingActionError('Landing workspace could not be loaded.');
  };

  const transitionLandingVersion = async (
    version: LandingVersion,
    targetStatus: LandingVersion['status']
  ) => runLandingCommand({
    action: 'transition_version',
    landing_id: version.landingId,
    version_number: version.versionNumber,
    target_status: targetStatus,
  }, `version:${version.versionId}:${targetStatus}`);

  // Open Drawer handler
  const handleOpenLeadDrawer = (lead: UnifiedLead) => {
    setSelectedLead(lead);
    setDrawerStatus(getLeadStatus(lead));
    setDrawerOwner(lead.crm?.owner_id || lead.owner_id || '');
    setDrawerNextAction(toDateTimeLocalValue(lead.crm?.next_action_at));
    setDrawerValue(getLeadValue(lead));
    setDrawerLostReason(lead.crm?.lost_reason || lead.lost_reason || '');
    setDrawerNotes(lead.crm?.notes || lead.conversion_reason || '');
    setDrawerRewardOverride(lead.wheel_reward_name || '');
    setDrawerReferralOverride(lead.referral_code_used || '');
    setDrawerLogs(buildLeadDrawerLogs(lead, leadActivities));

    const requestId = ++leadFeatureRequest.current;
    setLeadFeature(null);
    if (!onLoadAiLeadFeature || currentUser?.role === 'Sales Rep') {
      setLeadFeatureState('idle');
      return;
    }

    setLeadFeatureState('loading');
    void onLoadAiLeadFeature(lead.id).then((feature) => {
      if (leadFeatureRequest.current !== requestId) return;
      setLeadFeature(feature);
      setLeadFeatureState(feature ? 'ready' : 'missing');
    });
  };

  // Save Drawer edits
  const handleSaveDrawerDetails = () => {
    if (!selectedLead || readOnlyMode || !onUpdateLead) return;
    setIsSavingDrawer(true);
    
    const nextStatus = normalizeStatus(drawerStatus);
    const updates: Partial<UnifiedLead> = {
      status: nextStatus,
      crm: {
        ...(selectedLead.crm || {}),
        status: nextStatus,
        owner_id: drawerOwner || null,
        next_action_at: toIsoDateTime(drawerNextAction),
        converted_order_value: Number(drawerValue) || null,
        lost_reason: nextStatus === 'LOST' ? drawerLostReason : '',
        notes: drawerNotes
      },
      wheel_reward_name: drawerRewardOverride,
      referral_code_used: drawerReferralOverride
    };

    onUpdateLead(selectedLead.id, updates);
    
    setTimeout(() => {
      setIsSavingDrawer(false);
      setSelectedLead(prev => prev ? { ...prev, ...updates } : null);
      alert(lang === 'vi' ? 'Cập nhật thông tin Lead thành công!' : 'ອັບເດດຂໍ້ມູນ Lead ສຳເລັດ!');
    }, 400);
  };

  // Calculations on leads
  const filteredLeads = leads.filter(lead => {
    // Search filter
    const s = searchTerm.toLowerCase();
    const name = lead.identity?.pharmacy_name || lead.pharmacy_name || '';
    const contact = lead.identity?.contact_name || lead.contact_name || '';
    const phone = lead.identity?.phone || lead.phone_number || '';
    const matchesSearch = name.toLowerCase().includes(s) || contact.toLowerCase().includes(s) || phone.includes(s);

    if (!matchesSearch) return false;

    if (filterDate !== 'all') {
      const createdAt = new Date(lead.created_at);
      const now = new Date();
      if (Number.isNaN(createdAt.getTime())) return false;
      if (filterDate === 'today' && createdAt.toDateString() !== now.toDateString()) return false;
      if (
        filterDate === 'month'
        && (createdAt.getMonth() !== now.getMonth() || createdAt.getFullYear() !== now.getFullYear())
      ) return false;
    }

    // Unified Field Access
    const province = (lead.identity?.province || lead.province || '').toLowerCase();
    const campaignId = getLeadCampaignId(lead);
    const landingId = getLeadLandingId(lead);
    const leadType = getLeadType(lead);
    const variantId = getLeadVariant(lead);
    const source = getLeadSource(lead);

    // Filters
    if (filterProvince !== 'all' && province !== filterProvince.toLowerCase()) return false;
    if (filterLanding !== 'all' && landingId !== filterLanding) return false;
    if (filterCampaign !== 'all' && campaignId !== filterCampaign) return false;
    if (filterLeadType !== 'all' && leadType !== filterLeadType) return false;
    if (filterVariant !== 'all' && variantId !== filterVariant) return false;
    if (filterSource !== 'all' && source !== filterSource) return false;

    return true;
  });

  const filteredStats = landingStats.filter((stat) => {
    if (!matchesDateFilter(stat.date, filterDate)) return false;
    if (filterLanding !== 'all' && stat.landing_id !== filterLanding) return false;
    if (filterCampaign !== 'all' && stat.campaign_id !== filterCampaign) return false;
    return true;
  });

  const statsSupportCurrentFilters = (
    currentUser?.role !== 'Sales Rep'
    && statsLoadState === 'ready'
    && landingStats.length > 0
    && searchTerm.trim() === ''
    && filterProvince === 'all'
    && filterVariant === 'all'
    && filterDevice === 'all'
    && !(filterLeadType !== 'all' && filterSource !== 'all')
  );

  const ga4SupportsCurrentFilters = (
    analyticsApiState === 'ready'
    && Boolean(landingAnalytics)
    && filterDate === 'all'
    && filterCampaign === 'all'
    && filterLeadType === 'all'
    && filterVariant === 'all'
    && filterSource === 'all'
    && filterProvince === 'all'
    && filterDevice === 'all'
    && searchTerm.trim() === ''
  );
  const filteredGa4Summaries = ga4SupportsCurrentFilters
    ? landingAnalytics!.summaries.filter((summary) => (
      filterLanding === 'all' || summary.landing_id === filterLanding
    ))
    : [];
  const ga4Totals = filteredGa4Summaries.reduce((totals, summary) => ({
    sessions: totals.sessions + summary.sessions,
    activeUsers: totals.activeUsers + summary.active_users,
    pageViews: totals.pageViews + summary.page_views,
    scroll75: totals.scroll75 + summary.scroll_75,
    formStarts: totals.formStarts + summary.form_starts,
    generatedLeads: totals.generatedLeads + summary.generated_leads,
  }), {
    sessions: 0,
    activeUsers: 0,
    pageViews: 0,
    scroll75: 0,
    formStarts: 0,
    generatedLeads: 0,
  });
  const ga4ConversionRate = ga4Totals.sessions > 0
    ? Number(((ga4Totals.generatedLeads / ga4Totals.sessions) * 100).toFixed(2))
    : null;
  const ga4Scroll75Rate = ga4Totals.sessions > 0
    ? Number(((ga4Totals.scroll75 / ga4Totals.sessions) * 100).toFixed(2))
    : null;
  const ga4TrendMap = new Map<string, {
    date: string;
    sessions: number;
    generated_leads: number;
    form_starts: number;
  }>();
  if (ga4SupportsCurrentFilters && landingAnalytics) {
    landingAnalytics.trend
      .filter((row) => filterLanding === 'all' || row.landing_id === filterLanding)
      .forEach((row) => {
        const current = ga4TrendMap.get(row.date) || {
          date: row.date,
          sessions: 0,
          generated_leads: 0,
          form_starts: 0,
        };
        current.sessions += row.sessions;
        current.generated_leads += row.generated_leads;
        current.form_starts += row.form_starts;
        ga4TrendMap.set(row.date, current);
      });
  }
  const ga4Trend = Array.from(ga4TrendMap.values()).sort((a, b) => (
    a.date.localeCompare(b.date)
  ));
  const ga4Sections = ga4SupportsCurrentFilters && landingAnalytics
    ? landingAnalytics.sections
      .filter((row) => filterLanding === 'all' || row.landing_id === filterLanding)
      .sort((a, b) => b.active_users - a.active_users)
    : [];
  const ga4SummaryByLanding = new Map(
    (landingAnalytics?.summaries || []).map((summary) => [summary.landing_id, summary])
  );

  const aggregateLeadCount = filteredStats.reduce((sum, stat) => {
    if (filterSource !== 'all') {
      return sum + (stat.source_counts[toMetricKey(filterSource)] || 0);
    }
    if (filterLeadType !== 'all') {
      return sum + (stat.lead_type_counts[toMetricKey(filterLeadType)] || 0);
    }
    return sum + stat.total_leads;
  }, 0);

  // KPI Calculations
  const rawLeadsCount = filteredLeads.length;
  const displayedLeadCount = statsSupportCurrentFilters ? aggregateLeadCount : rawLeadsCount;
  const statsUpdatedAt = filteredStats.reduce(
    (latest, stat) => stat.updated_at > latest ? stat.updated_at : latest,
    ''
  );
  const dashboardSourceLabel = statsSupportCurrentFilters
    ? `Daily read model${statsTruncated && filterDate === 'all' ? ' (partial history)' : ''}`
    : `Latest ${leadReadLimit} lead details${leadLoadState === 'loading' ? ' (loading)' : ''}`;
  
  const comboStarterCount = filteredLeads.filter(l => ['COMBO_500K', 'basic'].includes(getLeadPackage(l))).length;
  const comboPremiumCount = filteredLeads.filter(l => ['COMBO_1M', 'advanced'].includes(getLeadPackage(l))).length;
  
  const qualifiedLeads = filteredLeads.filter(l => ['QUALIFIED', 'ORDER_PENDING', 'WON'].includes(getLeadStatus(l))).length;
  const qualificationRate = rawLeadsCount > 0
    ? ((qualifiedLeads / rawLeadsCount) * 100).toFixed(1)
    : '0';
  
  const totalRevenue = filteredLeads.reduce((acc, lead) => {
    const value = getLeadValue(lead);
    if (value) return acc + value;
    return acc;
  }, 0);

  const detailQualifiedBySource: Record<string, number> = {};
  filteredLeads.forEach((lead) => {
    if (!['QUALIFIED', 'ORDER_PENDING', 'WON'].includes(getLeadStatus(lead))) return;
    const source = getLeadSource(lead).toLowerCase();
    detailQualifiedBySource[source] = (detailQualifiedBySource[source] || 0) + 1;
  });

  const acquisitionUsesGa4 = ga4SupportsCurrentFilters && Boolean(landingAnalytics);
  const acquisitionUsesStats = !acquisitionUsesGa4
    && statsSupportCurrentFilters
    && filterLeadType === 'all';
  const acquisitionRows = (() => {
    if (acquisitionUsesGa4 && landingAnalytics) {
      return landingAnalytics.sources
        .filter((row) => filterLanding === 'all' || row.landing_id === filterLanding)
        .map((row) => ({
          source: row.source_medium,
          total: row.sessions,
          qualified: row.active_users,
        }))
        .sort((a, b) => b.total - a.total);
    }
    if (acquisitionUsesStats) {
      const sourceTotals: Record<string, number> = {};
      filteredStats.forEach((stat) => {
        Object.entries(stat.source_counts).forEach(([source, total]) => {
          sourceTotals[source] = (sourceTotals[source] || 0) + total;
        });
      });
      return Object.entries(sourceTotals)
        .filter(([source]) => filterSource === 'all' || source === toMetricKey(filterSource))
        .map(([source, total]) => ({
          source,
          total,
          qualified: detailQualifiedBySource[source] || 0
        }))
        .sort((a, b) => b.total - a.total);
    }

    const sourcesMap: Record<string, { total: number, qualified: number }> = {};
    filteredLeads.forEach((lead) => {
      const source = getLeadSource(lead).toLowerCase();
      const medium = getLeadMedium(lead).toLowerCase();
      const key = `${source} / ${medium}`;
      if (!sourcesMap[key]) sourcesMap[key] = { total: 0, qualified: 0 };
      sourcesMap[key].total += 1;
      if (['QUALIFIED', 'ORDER_PENDING', 'WON'].includes(getLeadStatus(lead))) {
        sourcesMap[key].qualified += 1;
      }
    });
    return Object.entries(sourcesMap)
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.total - a.total);
  })();

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'CONTACT_PENDING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'WORKING':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'QUALIFIED':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'ORDER_PENDING':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'WON':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LOST':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    }
  };

  const getProvinceLaoName = (prov: string) => {
    return PROVINCE_MAP[prov.toLowerCase()] || prov;
  };

  const exportLeadsCsv = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      "Landing ID", "Campaign ID", "Lead Type", "Landing Variant", "Source", "Medium",
      "Pharmacy Name", "Contact Person", "Phone", "Province",
      "Combo Package/Products", "Display Program", "Owner", "Next Action At", "Value LAK", "Status", "Created At"
    ];
    
    const rows = filteredLeads.map(l => {
      // Format items if any
      const itemsString = l.selection?.items 
        ? l.selection.items.map(i => `${i.product_id} (x${i.quantity})`).join('; ') 
        : l.selected_combo || '';

      return [
        getLeadLandingId(l),
        getLeadCampaignId(l),
        getLeadType(l),
        getLeadVariant(l),
        getLeadSource(l),
        getLeadMedium(l),
        l.identity?.pharmacy_name || l.pharmacy_name || '',
        l.identity?.contact_name || l.contact_name || '',
        l.identity?.phone || l.phone_number || '',
        l.identity?.province || l.province || '',
        itemsString,
        getLeadReward(l),
        l.crm?.owner_id || l.owner_id || '',
        l.crm?.next_action_at || '',
        getLeadValue(l) || '',
        getLeadStatus(l),
        l.created_at
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nnc_laos_leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080B10] text-slate-100 flex flex-col font-sans select-none">
      
      {/* COMPACT TOP BAR */}
      <header className="bg-[#0D121F] border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-35">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-950/40 rounded-xl flex items-center justify-center border border-emerald-900/50">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white uppercase">NNC Lead CRM</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentUser?.email}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
        </div>

        {/* Global compact filter pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(canViewAnalytics || canViewLeadCrm) && (
            <>
          {/* Date Selector */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-slate-350 cursor-pointer">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Landing Selector */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <select value={filterLanding} onChange={(e) => setFilterLanding(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-emerald-300 cursor-pointer">
              <option value="all">All Landings</option>
              {landingOptions.map((landing) => (
                <option key={landing.landingId} value={landing.landingId}>{landing.slug}</option>
              ))}
            </select>
          </div>

          {/* Campaign Selector */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-slate-350 cursor-pointer">
              <option value="all">All Campaigns</option>
              {campaignOptions.map((campaignId) => (
                <option key={campaignId} value={campaignId}>{campaignId}</option>
              ))}
            </select>
          </div>

          {/* Lead Type Filter */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-500" />
            <select value={filterLeadType} onChange={(e) => setFilterLeadType(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-emerald-300 cursor-pointer">
              <option value="all">All Lead Types</option>
              <option value="ORDER">🛒 Đặt hàng</option>
              <option value="SAMPLE_REQUEST">🔬 Nhận mẫu</option>
            </select>
          </div>

          {/* Variant Selector */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <select value={filterVariant} onChange={(e) => setFilterVariant(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-slate-350 cursor-pointer">
              <option value="all">All Variants</option>
              {variantOptions.map((variantId) => (
                <option key={variantId} value={variantId}>{variantId}</option>
              ))}
            </select>
          </div>

          {/* Province Selector */}
          <div className="flex items-center gap-1 bg-[#141B2D] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="bg-transparent border-none text-[11px] font-bold outline-none text-slate-350 cursor-pointer">
              <option value="all">All Provinces</option>
              <option value="vientiane">Vientiane Capital</option>
              <option value="savannakhet">Savannakhet</option>
              <option value="champasak">Champasak</option>
              <option value="luangprabang">Luang Prabang</option>
              <option value="khammouane">Khammouane</option>
            </select>
          </div>
            </>
          )}

          {/* Logout Action */}
          <button onClick={onLogout} className="px-3 py-1.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900 text-red-200 hover:text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer">
            <LogOut className="w-3 h-3" />
            <span>{lang === 'vi' ? 'Đăng xuất' : 'ອອກ'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 9-TAB NAVIGATION SIDEBAR */}
        <aside className="w-64 bg-[#0A0E1A] border-r border-slate-800/80 p-4 space-y-1.5 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block px-2.5 mb-3">Lead workspace</span>
            
            {(canViewAnalytics || canViewLandingPages) && (
              <>
                {/* Tab 1: Overview */}
                {canViewAnalytics && (
                  <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 shrink-0" />
                      <span>Overview Dashboard</span>
                    </div>
                  </button>
                )}

                {canViewLandingPages && (
                  <button onClick={() => setActiveTab('landings')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'landings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Landing Pages</span>
                    </div>
                  </button>
                )}

                {/* Tab 2: Acquisition */}
                {canViewAnalytics && (
                  <button onClick={() => setActiveTab('acquisition')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'acquisition' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>Acquisition Channels</span>
                    </div>
                  </button>
                )}
              </>
            )}

            {/* Tab 5: Leads Directory */}
            {canViewLeadCrm && (
              <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'leads' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Leads Directory</span>
                </div>
              </button>
            )}

            {/* Tab 6: Sales Pipeline */}
            {canViewLeadCrm && (
              <button onClick={() => setActiveTab('pipeline')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'pipeline' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Sales Pipeline</span>
                </div>
              </button>
            )}


            {/* Tab 9: Settings */}
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 shrink-0" />
                <span>CRM Settings</span>
              </div>
            </button>
          </div>

          {/* User Session Info */}
          <div className="p-3 bg-[#111625] rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                Role: {currentUser?.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-medium">
              {currentUser?.role === 'Sales Rep'
                ? 'Assigned-lead scope. Campaign analytics and AI features are restricted.'
                : currentUser?.role === 'Regulatory'
                  ? 'Version and claim review scope. Raw lead access is restricted.'
                  : currentUser?.role === 'Analyst'
                    ? 'Aggregate analytics scope. Raw lead access is restricted.'
                : 'Direct Firestore read-only scope. Analytics remains in Firebase / GA4.'}
            </p>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT SPACE */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && canViewAnalytics && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white font-display">Lead Operations Overview</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Firestore lead operations stay here; marketing behavior stays in GA4.</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase ${ga4SupportsCurrentFilters ? 'text-cyan-300' : 'text-amber-400'}`}>
                    {ga4SupportsCurrentFilters
                      ? `GA4 through ${landingAnalytics?.freshness.latest_complete_date}`
                      : analyticsApiState === 'loading'
                        ? 'GA4 loading'
                        : 'GA4 native dashboard'}
                  </span>
                  <span className="block text-[9px] text-slate-500 mt-1">
                    {dashboardSourceLabel}
                    {statsSupportCurrentFilters && statsUpdatedAt
                      ? ` · CRM through ${statsUpdatedAt.slice(0, 10)}`
                      : ''}
                  </span>
                </div>
              </div>

              {(analyticsApiState === 'unavailable' || analyticsApiState === 'error') && (
                <div className="flex items-start gap-2 border border-amber-900/70 bg-amber-950/25 px-4 py-3 text-xs text-amber-100">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-black">GA4 is intentionally separated from CRM.</span>
                    <span className="ml-1 text-amber-200/75">
                      {analyticsApiError}
                    </span>
                    <a
                      href="https://console.firebase.google.com/project/nnccampaignplatformproduction/analytics"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-1 font-bold text-amber-300 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-200"
                    >
                      Open Firebase Analytics <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* 8 KPI Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Sessions</span>
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">
                    {ga4SupportsCurrentFilters ? ga4Totals.sessions.toLocaleString() : '—'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    GA4 · {landingAnalytics?.date_from || 'not configured'} to {landingAnalytics?.date_to || '—'}
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">75% Scroll Rate</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">
                    {ga4SupportsCurrentFilters && ga4Scroll75Rate != null
                      ? `${ga4Scroll75Rate}%`
                      : '—'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    Unique 75% milestones / sessions
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Lead CVR</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">
                    {ga4SupportsCurrentFilters && ga4ConversionRate != null
                      ? `${ga4ConversionRate}%`
                      : '—'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    GA4 generate_lead / sessions
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Total Leads</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">{displayedLeadCount}</span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    {statsSupportCurrentFilters ? 'Aggregated form submissions' : 'Count in loaded detail window'}
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Loaded Lead Details</span>
                    <Database className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">{rawLeadsCount}</span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    Capped at {leadReadLimit} records for operations
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Qualified Leads <span className="font-normal text-[10px] text-slate-400 ml-1">(Firestore CRM)</span></span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">{qualifiedLeads}</span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">Status: Qualified, Won, Order Pending</span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Qualification Rate</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="mt-2 text-2xl font-black text-white">{qualificationRate}%</span>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">
                    Qualified statuses / loaded CRM details
                  </span>
                </div>

                <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between text-slate-450">
                    <span className="text-xs font-bold">Expected Revenue</span>
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-lg font-black text-emerald-400 font-mono">{totalRevenue.toLocaleString()} LAK</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-1">Aggregate value of all active leads</span>
                </div>
              </div>

              {ga4SupportsCurrentFilters && ga4Trend.length >= 8 && (
                <div className="grid gap-6 xl:grid-cols-12">
                  <section className="border border-slate-800 bg-[#0E1322] p-5 xl:col-span-7">
                    <div className="mb-4">
                      <h4 className="text-xs font-black uppercase text-slate-300">
                        Sessions and Generated Leads
                      </h4>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Daily GA4 counts · {landingAnalytics?.date_from} to {landingAnalytics?.date_to}
                      </p>
                    </div>
                    <div className="h-[280px] min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ga4Trend} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickFormatter={(value) => String(value).slice(5)}
                          />
                          <YAxis
                            allowDecimals={false}
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#111625',
                              border: '1px solid #334155',
                              borderRadius: 4,
                              color: '#f8fafc',
                              fontSize: 11,
                            }}
                            labelStyle={{ color: '#cbd5e1' }}
                          />
                          <Legend wrapperStyle={{ fontSize: 10, color: '#cbd5e1' }} />
                          <Line
                            type="monotone"
                            dataKey="sessions"
                            name="Sessions"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="generated_leads"
                            name="Generated leads"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="6 4"
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="border border-slate-800 bg-[#0E1322] p-5 xl:col-span-5">
                    <div className="mb-4">
                      <h4 className="text-xs font-black uppercase text-slate-300">
                        Section Reach
                      </h4>
                      <p className="mt-1 text-[10px] text-slate-500">
                        GA4 active users by section · same complete date window
                      </p>
                    </div>
                    {ga4Sections.length >= 4 ? (
                      <div className="h-[280px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={ga4Sections.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 4, right: 16, left: 16, bottom: 0 }}
                          >
                            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
                            <XAxis
                              type="number"
                              allowDecimals={false}
                              stroke="#64748b"
                              tick={{ fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis
                              type="category"
                              dataKey="section_id"
                              width={92}
                              stroke="#64748b"
                              tick={{ fill: '#cbd5e1', fontSize: 10 }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: '#111625',
                                border: '1px solid #334155',
                                borderRadius: 4,
                                color: '#f8fafc',
                                fontSize: 11,
                              }}
                            />
                            <Bar
                              dataKey="active_users"
                              name="Active users"
                              fill="#22d3ee"
                              stroke="#0e7490"
                              radius={[0, 3, 3, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex h-[280px] items-center justify-center text-center text-xs text-slate-500">
                        Section chart requires at least four populated sections.
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* Geographic and Campaign visual grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Laos Province Breakdown */}
                <div className="lg:col-span-6 bg-[#0E1322] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Geographic Province Distribution</h4>
                  <div className="space-y-2">
                    {['vientiane', 'savannakhet', 'champasak', 'luangprabang', 'khammouane'].map(prov => {
                      const count = filteredLeads.filter(
                        lead => (lead.identity?.province || lead.province || '').toLowerCase() === prov
                      ).length;
                      const pct = rawLeadsCount > 0 ? Math.round((count / rawLeadsCount) * 100) : 0;
                      return (
                        <div key={prov} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300 font-mono capitalize">{prov}</span>
                            <span className="text-slate-400">{count} Leads ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CRM package mix */}
                <div className="lg:col-span-6 bg-[#0E1322] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Package Mix</h4>
                    <p className="mt-1 text-[10px] text-slate-500">Loaded CRM details · exact counts</p>
                  </div>
                  <div className="space-y-4 py-3">
                    {[
                      { label: 'Premium (1M LAK)', value: comboPremiumCount, color: 'bg-emerald-500' },
                      { label: 'Starter (500K LAK)', value: comboStarterCount, color: 'bg-slate-500' },
                    ].map((item) => {
                      const pct = rawLeadsCount > 0
                        ? Math.round((item.value / rawLeadsCount) * 100)
                        : 0;
                      return (
                        <div key={item.label}>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">{item.label}</span>
                            <span className="font-mono text-slate-400">{item.value} · {pct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                            <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'landings' && canViewLandingPages && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white font-display">Landing Page Registry</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Runtime metadata for campaign, template, publish state, version, form, and analytics.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase ${landingRegistrySource === 'api' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {landingRegistrySource === 'api' ? 'Lifecycle API' : 'Local fallback'}
                  </span>
                  {canManageLandingPages && (
                    landingRegistrySource !== 'api'
                    || selectedLandingVersions.length === 0
                    || !formsReady
                  ) && (
                    <button
                      type="button"
                      disabled={landingUpdatePending === '__seed__'}
                      onClick={async () => {
                        await runLandingCommand({ action: 'initialize' }, '__seed__');
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-[10px] font-black rounded-lg transition"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>
                        {landingUpdatePending === '__seed__'
                          ? 'Initializing...'
                          : landingRegistrySource === 'api'
                            ? 'Repair source registry'
                            : 'Initialize registry'}
                      </span>
                    </button>
                  )}
                  <span className="text-[10px] font-black uppercase text-slate-500">
                    {landingPages.length} configured
                  </span>
                </div>
              </div>

              <div className="bg-[#0E1322] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1380px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-800">
                        <th className="p-4">Landing</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Campaign</th>
                        <th className="p-4">Template / Variant</th>
                        <th className="p-4 text-center">Version</th>
                        <th className="p-4 text-right">Sessions</th>
                        <th className="p-4 text-right">75% Scroll</th>
                        <th className="p-4 text-right">Leads</th>
                        <th className="p-4 text-right">CVR</th>
                        <th className="p-4">Updated / Owner</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {landingPages.map((landing) => (
                        <tr key={landing.slug} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-4">
                            <span className="block text-white font-black">{landing.name}</span>
                            <span className="block text-[10px] text-emerald-400 font-mono mt-1">
                              /lp/{landing.slug}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                              landing.status === 'published'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : landing.status === 'review'
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'bg-slate-800 text-slate-300'
                            }`}>
                              {landing.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-300 font-mono">{landing.campaignId}</span>
                          </td>
                          <td className="p-4">
                            <span className="block text-slate-300">{landing.templateId}</span>
                            <span className="block text-[10px] text-slate-500 mt-1">{landing.defaultVariant}</span>
                          </td>
                          <td className="p-4 text-center text-white font-mono">
                            v{landing.activeVersion}
                            {landing.latestVersion > landing.activeVersion && (
                              <span className="block mt-1 text-[9px] text-amber-400">
                                latest v{landing.latestVersion}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-300" title="GA4 Data API, latest complete 30-day window">
                            {ga4SummaryByLanding.get(landing.landingId)?.sessions.toLocaleString() || '—'}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-300" title="Unique 75% scroll events divided by sessions">
                            {ga4SummaryByLanding.get(landing.landingId)?.scroll_75_rate != null
                              ? `${ga4SummaryByLanding.get(landing.landingId)!.scroll_75_rate}%`
                              : '—'}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-emerald-400">
                            {getLandingLeadTotal(landing.landingId)}
                          </td>
                          <td className="p-4 text-right font-mono text-slate-300" title="GA4 generate_lead events divided by sessions">
                            {ga4SummaryByLanding.get(landing.landingId)?.conversion_rate != null
                              ? `${ga4SummaryByLanding.get(landing.landingId)!.conversion_rate}%`
                              : '—'}
                          </td>
                          <td className="p-4">
                            <span className="block text-[10px] text-slate-300">
                              {landing.updatedAt?.slice(0, 10) || 'Not synced'}
                            </span>
                            <span className="mt-1 block max-w-[160px] truncate text-[9px] text-slate-500">
                              {landing.updatedBy || landing.createdBy || 'source lock'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              title={`Manage ${landing.name}`}
                              onClick={() => void selectLandingWorkspace(landing.landingId)}
                              className={`inline-flex items-center justify-center p-2 rounded-lg mr-1 transition ${
                                selectedLanding?.landingId === landing.landingId
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title={`Preview ${landing.name}`}
                              onClick={() => window.open(`/lp/${landing.slug}`, '_blank', 'noopener,noreferrer')}
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500">
                  Leads use the Firestore daily aggregate. Sessions, 75% scroll, and CVR use the GA4 Data API latest complete 30-day window when configured; unavailable values remain blank.
                </div>
                {!canManageLandingPages && (
                  <div className="px-4 py-3 border-t border-slate-800 text-[10px] text-slate-500">
                    Read-only registry. Publish-state changes require Marketing Admin or System Admin.
                  </div>
                )}
              </div>

              {landingActionError && (
                <div className="flex items-start gap-2 border border-red-900/70 bg-red-950/30 px-4 py-3 text-xs text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{landingActionError}</span>
                </div>
              )}

              {selectedLanding && (
                <section className="border border-slate-800 bg-[#0E1322]">
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-sm font-black text-white">{selectedLanding.name}</h4>
                      </div>
                      <p className="mt-1 text-[10px] font-mono text-slate-500">
                        {selectedLanding.landingId} · {selectedLanding.campaignId}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {canManageLandingPages && (
                        <>
                          <button
                            type="button"
                            disabled={Boolean(landingUpdatePending)}
                            onClick={() => void runLandingCommand({
                              action: 'create_version',
                              landing_id: selectedLanding.landingId,
                            }, `create:${selectedLanding.landingId}`)}
                            className="inline-flex items-center gap-2 bg-emerald-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            Create version
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDuplicateDraft({
                                landingId: `${selectedLanding.slug}-copy`,
                                name: `${selectedLanding.name} Copy`,
                                campaignId: `${selectedLanding.campaignId}_COPY`,
                              });
                              setLandingDetailTab('overview');
                            }}
                            className="inline-flex items-center gap-2 border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-black text-slate-200 transition hover:bg-slate-700"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Duplicate
                          </button>
                        </>
                      )}
                    </div>
                  </header>

                  <div className="flex gap-1 overflow-x-auto border-b border-slate-800 px-4 pt-3">
                    {(selectedLanding.landingId === 'nnc-b2b-online-rewards-q3-2026'
                      ? (['overview', 'versions', 'form', 'assets', 'claims', 'referrals', 'rewards'] as const)
                      : (['overview', 'versions', 'form', 'assets', 'claims'] as const)).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setLandingDetailTab(tab)}
                        className={`min-w-max border-b-2 px-3 py-2 text-[10px] font-black uppercase transition ${
                          landingDetailTab === tab
                            ? 'border-emerald-500 text-emerald-300'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {landingDetailTab === 'overview' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                          {[
                            ['Public state', selectedLanding.status],
                            ['Active version', `v${selectedLanding.activeVersion}`],
                            ['Latest version', `v${selectedLanding.latestVersion}`],
                            ['Claim mode', selectedLanding.claimMode],
                          ].map(([label, value]) => (
                            <div key={label} className="border border-slate-800 bg-[#111625] p-3">
                              <span className="block text-[9px] font-black uppercase text-slate-500">{label}</span>
                              <span className="mt-1 block text-xs font-black text-white">{value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="border border-slate-800 bg-[#111625] p-4">
                            <h5 className="text-[10px] font-black uppercase text-slate-400">
                              Publish invariant
                            </h5>
                            <div className="mt-3 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Source-locked version</span>
                                <span className="font-black text-emerald-400">Required</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Regulatory approval</span>
                                <span className="font-black text-emerald-400">Required</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Runtime-bound forms</span>
                                <span className={formsReady ? 'font-black text-emerald-400' : 'font-black text-red-400'}>
                                  {boundFormCount}/{activeFormFlows.length || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Unapproved referenced claims</span>
                                <span className="font-black text-amber-400">
                                  {selectedClaims.filter((claim) => (
                                    relevantClaimIds.has(claim.claimId)
                                    && !claim.approvedForPublicUse
                                  )).length}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Non-release assets</span>
                                <span className={blockedAssets.length ? 'font-black text-red-400' : 'font-black text-emerald-400'}>
                                  {blockedAssets.length}
                                </span>
                              </div>
                            </div>
                          </div>

                          {canManageLandingPages && duplicateDraft.landingId && (
                            <form
                              className="border border-slate-800 bg-[#111625] p-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void runLandingCommand({
                                  action: 'duplicate_landing',
                                  landing_id: selectedLanding.landingId,
                                  new_landing_id: duplicateDraft.landingId,
                                  name: duplicateDraft.name,
                                  campaign_id: duplicateDraft.campaignId,
                                }, `duplicate:${selectedLanding.landingId}`).then((saved) => {
                                  if (saved) setDuplicateDraft({ landingId: '', name: '', campaignId: '' });
                                });
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-black uppercase text-slate-400">
                                  Duplicate as draft
                                </h5>
                                <button
                                  type="button"
                                  title="Close duplicate form"
                                  onClick={() => setDuplicateDraft({ landingId: '', name: '', campaignId: '' })}
                                  className="p-1 text-slate-500 hover:text-white"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="mt-3 grid gap-2">
                                <input
                                  aria-label="New landing slug"
                                  value={duplicateDraft.landingId}
                                  onChange={(event) => setDuplicateDraft((current) => ({
                                    ...current,
                                    landingId: event.target.value,
                                  }))}
                                  className="border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                                  placeholder="new-landing-slug"
                                />
                                <input
                                  aria-label="New landing name"
                                  value={duplicateDraft.name}
                                  onChange={(event) => setDuplicateDraft((current) => ({
                                    ...current,
                                    name: event.target.value,
                                  }))}
                                  className="border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                                  placeholder="Landing name"
                                />
                                <input
                                  aria-label="New campaign ID"
                                  value={duplicateDraft.campaignId}
                                  onChange={(event) => setDuplicateDraft((current) => ({
                                    ...current,
                                    campaignId: event.target.value,
                                  }))}
                                  className="border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                                  placeholder="CAMPAIGN_ID"
                                />
                                <button
                                  type="submit"
                                  disabled={Boolean(landingUpdatePending)}
                                  className="mt-1 inline-flex items-center justify-center gap-2 bg-emerald-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Create draft copy
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    )}

                    {landingDetailTab === 'versions' && (
                      <div className="space-y-3">
                        {landingUpdatePending === `load:${selectedLanding.landingId}` && (
                          <div className="py-8 text-center text-xs text-slate-500">Loading versions...</div>
                        )}
                        {selectedLandingVersions.map((version) => (
                          <article
                            key={version.versionId}
                            className="grid gap-4 border border-slate-800 bg-[#111625] p-4 lg:grid-cols-[1fr_auto]"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-black text-white">
                                  v{version.versionNumber}
                                </span>
                                <span className={`px-2 py-1 text-[9px] font-black uppercase ${
                                  version.status === 'published'
                                    ? 'bg-emerald-500/15 text-emerald-300'
                                    : version.status === 'approved'
                                      ? 'bg-cyan-500/15 text-cyan-300'
                                      : version.status.includes('review')
                                        ? 'bg-amber-500/15 text-amber-300'
                                        : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {version.status.replace(/_/g, ' ')}
                                </span>
                                {version.sourceLocked && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
                                    <ShieldCheck className="h-3 w-3" />
                                    source locked
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-500">
                                <span>{version.sections.filter((section) => section.enabled).length} enabled sections</span>
                                <span>{version.claimRefs.length} claim refs</span>
                                <span>{version.formId}</span>
                                {version.regulatoryApprovedAt && (
                                  <span>Approved {version.regulatoryApprovedAt.slice(0, 10)}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {canManageLandingPages && version.status === 'draft' && (
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void transitionLandingVersion(version, 'internal_review')}
                                  className="inline-flex items-center gap-1.5 border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-[10px] font-black text-amber-200 disabled:opacity-50"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  Internal review
                                </button>
                              )}
                              {canManageLandingPages && version.status === 'internal_review' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={Boolean(landingUpdatePending)}
                                    onClick={() => void transitionLandingVersion(version, 'draft')}
                                    className="border border-slate-700 px-3 py-2 text-[10px] font-black text-slate-300 disabled:opacity-50"
                                  >
                                    Return draft
                                  </button>
                                  <button
                                    type="button"
                                    disabled={Boolean(landingUpdatePending)}
                                    onClick={() => void transitionLandingVersion(version, 'regulatory_review')}
                                    className="inline-flex items-center gap-1.5 bg-amber-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    Regulatory review
                                  </button>
                                </>
                              )}
                              {canReviewLandingPages && version.status === 'regulatory_review' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={Boolean(landingUpdatePending)}
                                    onClick={() => void transitionLandingVersion(version, 'draft')}
                                    className="border border-red-800 px-3 py-2 text-[10px] font-black text-red-300 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    disabled={Boolean(landingUpdatePending)}
                                    onClick={() => void transitionLandingVersion(version, 'approved')}
                                    className="inline-flex items-center gap-1.5 bg-cyan-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                </>
                              )}
                              {canManageLandingPages && version.status === 'approved' && (
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void transitionLandingVersion(version, 'published')}
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Publish
                                </button>
                              )}
                              {canManageLandingPages && version.status === 'published' && (
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void transitionLandingVersion(version, 'retired')}
                                  className="border border-slate-700 px-3 py-2 text-[10px] font-black text-slate-300 disabled:opacity-50"
                                >
                                  Unpublish
                                </button>
                              )}
                              {canManageLandingPages && version.status === 'retired' && (
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void transitionLandingVersion(version, 'published')}
                                  className="inline-flex items-center gap-1.5 border border-emerald-700 bg-emerald-950/30 px-3 py-2 text-[10px] font-black text-emerald-200 disabled:opacity-50"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Roll back
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                        {selectedLandingVersions.length === 0 && !landingUpdatePending && (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No version documents loaded for this landing.
                          </div>
                        )}
                      </div>
                    )}

                    {landingDetailTab === 'form' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                          {[
                            ['Source flows', selectedLandingForms.length],
                            ['Runtime bound', `${boundFormCount}/${activeFormFlows.length || 0}`],
                            ['PII fields', formPiiFieldCount],
                            ['Contract blockers', formBlockers.length],
                          ].map(([label, value]) => (
                            <div key={label} className="border border-slate-800 bg-[#111625] p-3">
                              <span className="block text-[9px] font-black uppercase text-slate-500">{label}</span>
                              <span className={`mt-1 block text-lg font-black ${
                                label === 'Contract blockers' && Number(value) > 0
                                  ? 'text-red-400'
                                  : 'text-white'
                              }`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {selectedLandingForms.map((form) => {
                          const activeBound = selectedFormRefs[form.flowKey] === form.contractId;
                          const draftBound = editableFormVersion?.formRefs[form.flowKey] === form.contractId;
                          const canBind = Boolean(
                            canManageLandingPages
                            && editableFormVersion
                            && form.status === 'active'
                            && form.sourceLocked
                            && form.runtimeReady
                            && form.schemaHash
                            && form.runtimeBinding
                            && !draftBound
                          );
                          const directPiiCount = form.fields.filter(
                            (field) => field.piiClass === 'direct_identifier'
                          ).length;
                          return (
                            <article key={form.contractId} className="border border-slate-800 bg-[#111625]">
                              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <FileText className="h-4 w-4 text-cyan-400" />
                                    <h5 className="text-xs font-black text-white">{form.name}</h5>
                                    <span className={`px-2 py-1 text-[9px] font-black uppercase ${
                                      activeBound && form.runtimeReady
                                        ? 'bg-emerald-500/15 text-emerald-300'
                                        : 'bg-red-500/15 text-red-300'
                                    }`}>
                                      {activeBound && form.runtimeReady
                                        ? 'runtime bound'
                                        : form.runtimeReady
                                          ? 'not active-bound'
                                          : 'schema drift'}
                                    </span>
                                  </div>
                                  <p className="mt-1 break-all font-mono text-[9px] text-slate-500">
                                    {form.contractId}
                                  </p>
                                </div>
                                {canBind && editableFormVersion && (
                                  <button
                                    type="button"
                                    disabled={Boolean(landingUpdatePending)}
                                    onClick={() => void runLandingCommand({
                                      action: 'bind_form_contract',
                                      landing_id: selectedLanding.landingId,
                                      version_number: editableFormVersion.versionNumber,
                                      flow_key: form.flowKey,
                                      contract_id: form.contractId,
                                    }, `form:${editableFormVersion.versionNumber}:${form.flowKey}`)}
                                    className="inline-flex items-center gap-1.5 border border-cyan-800 bg-cyan-950/30 px-3 py-2 text-[10px] font-black text-cyan-200 disabled:opacity-50"
                                  >
                                    <GitBranch className="h-3.5 w-3.5" />
                                    Bind to v{editableFormVersion.versionNumber}
                                  </button>
                                )}
                              </div>

                              <div className="grid gap-px border-b border-slate-800 bg-slate-800 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                  ['Flow', form.flowKey],
                                  ['Renderer', form.runtimeBinding || 'missing'],
                                  ['Contact basis', form.compliancePolicy.contactBasis.replace(/_/g, ' ')],
                                  ['Schema', form.schemaHash ? form.schemaHash.slice(7, 19) : 'missing'],
                                ].map(([label, value]) => (
                                  <div key={label} className="bg-[#0d1220] px-4 py-3">
                                    <span className="block text-[8px] font-black uppercase text-slate-600">{label}</span>
                                    <span className="mt-1 block break-words text-[10px] font-bold text-slate-300">{value}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-[10px]">
                                  <thead className="bg-[#0d1220] text-[8px] font-black uppercase text-slate-600">
                                    <tr>
                                      <th className="px-4 py-2">Field</th>
                                      <th className="px-4 py-2">Canonical path</th>
                                      <th className="px-4 py-2">Type</th>
                                      <th className="px-4 py-2">Requirement</th>
                                      <th className="px-4 py-2">PII class</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {form.fields.map((field) => (
                                      <tr key={`${form.contractId}:${field.path}`}>
                                        <td className="px-4 py-2 font-mono text-slate-300">{field.id}</td>
                                        <td className="px-4 py-2 font-mono text-slate-500">{field.path}</td>
                                        <td className="px-4 py-2 text-slate-400">{field.type}</td>
                                        <td className="px-4 py-2 text-slate-400">
                                          {field.required ? 'required' : 'optional'}
                                        </td>
                                        <td className={`px-4 py-2 font-black ${
                                          field.piiClass === 'direct_identifier'
                                            ? 'text-red-300'
                                            : field.piiClass === 'non_pii'
                                              ? 'text-emerald-300'
                                              : 'text-amber-300'
                                        }`}>
                                          {field.piiClass.replace(/_/g, ' ')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 px-4 py-3 text-[9px]">
                                <span className="text-slate-500">
                                  {directPiiCount} direct identifiers · marketing consent {form.compliancePolicy.marketingConsent ? 'enabled' : 'disabled'}
                                </span>
                                <span className={form.sourceLocked && form.runtimeReady ? 'font-black text-emerald-400' : 'font-black text-red-400'}>
                                  {form.sourceLocked && form.runtimeReady
                                    ? 'Source locked · hash verified'
                                    : 'Contract verification failed'}
                                </span>
                              </div>
                            </article>
                          );
                        })}

                        {selectedLandingForms.length === 0 && (
                          <div className="border border-amber-900/50 bg-amber-950/20 p-5 text-xs text-amber-200">
                            No source-approved form contracts are materialized for this landing. Run registry initialization before publishing.
                          </div>
                        )}

                        <p className="text-[10px] leading-relaxed text-slate-500">
                          Contracts are code/source approved and immutable. The admin can bind a compatible revision to an editable landing version, but cannot edit public fields or renderer behavior here.
                        </p>
                      </div>
                    )}

                    {landingDetailTab === 'assets' && (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="border border-slate-800 bg-[#111625] p-3">
                            <span className="block text-[9px] font-black uppercase text-slate-500">Registered</span>
                            <span className="mt-1 block text-lg font-black text-white">{selectedAssets.length}</span>
                          </div>
                          <div className="border border-slate-800 bg-[#111625] p-3">
                            <span className="block text-[9px] font-black uppercase text-slate-500">Release ready</span>
                            <span className="mt-1 block text-lg font-black text-emerald-400">
                              {selectedAssets.length - blockedAssets.length}
                            </span>
                          </div>
                          <div className="border border-slate-800 bg-[#111625] p-3">
                            <span className="block text-[9px] font-black uppercase text-slate-500">Publish blockers</span>
                            <span className={`mt-1 block text-lg font-black ${blockedAssets.length ? 'text-red-400' : 'text-emerald-400'}`}>
                              {blockedAssets.length}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-px border border-slate-800 bg-slate-800 sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            ['Pending', pendingAssetJobs.length, 'text-amber-300'],
                            ['Verified', verifiedAssetJobs.length, 'text-cyan-300'],
                            ['Approved candidate', approvedAssetJobs.length, 'text-emerald-300'],
                            ['Failed / rejected', failedAssetJobs.length, 'text-red-300'],
                          ].map(([label, value, tone]) => (
                            <div key={String(label)} className="bg-[#0d1220] px-4 py-3">
                              <span className="block text-[8px] font-black uppercase text-slate-600">
                                {label}
                              </span>
                              <span className={`mt-1 block text-lg font-black ${tone}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-[10px] font-black uppercase text-slate-400">
                            Source manifest
                          </h4>
                          {assetOperationPending?.startsWith('upload:') && assetOperationPhase && (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-cyan-300">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              {assetOperationPhase.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>

                        {selectedAssets.map((asset) => {
                          const releaseReady = asset.productionReady
                            || asset.publicAccess === 'hcp_acknowledgement_and_regulatory_review';
                          return (
                            <article
                              key={asset.assetId}
                              className="grid gap-4 border border-slate-800 bg-[#111625] p-4 lg:grid-cols-[1fr_auto]"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <ImageIcon className="h-4 w-4 text-slate-500" />
                                  <span className="font-mono text-[10px] font-black text-slate-300">
                                    {asset.assetId}
                                  </span>
                                  <span className={`px-2 py-1 text-[9px] font-black uppercase ${
                                    releaseReady
                                      ? 'bg-emerald-500/15 text-emerald-300'
                                      : 'bg-red-500/15 text-red-300'
                                  }`}>
                                    {releaseReady ? 'release ready' : 'blocked'}
                                  </span>
                                </div>
                                <p className="mt-2 truncate text-xs font-black text-white">{asset.filename}</p>
                                <p className="mt-1 text-[10px] text-slate-500">
                                  {asset.type.replace(/_/g, ' ')} · {asset.status.replace(/_/g, ' ')}
                                </p>
                                <p className="mt-2 break-all font-mono text-[9px] text-slate-600">
                                  {asset.runtimePath || asset.sourcePath || 'No runtime path'}
                                </p>
                              </div>
                              <div className="flex min-w-[190px] flex-col items-end gap-3 text-right text-[9px]">
                                <div>
                                  <span className="block font-black uppercase text-slate-500">Access</span>
                                  <span className="mt-1 block max-w-[220px] text-slate-300">
                                    {asset.publicAccess.replace(/_/g, ' ')}
                                  </span>
                                  <span className="mt-2 block font-mono text-slate-600">
                                    {asset.sourceHash ? `${asset.sourceHash.slice(0, 12)}…` : 'hash not supplied'}
                                  </span>
                                </div>
                                {canManageLandingPages && onUploadAssetReplacement && (
                                  <label
                                    className={`inline-flex min-h-9 items-center gap-2 border border-cyan-800 px-3 py-2 text-[10px] font-black text-cyan-200 ${
                                      assetOperationPending
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer hover:bg-cyan-950/30'
                                    }`}
                                  >
                                    {assetOperationPending === `upload:${asset.assetId}`
                                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      : <Upload className="h-3.5 w-3.5" />}
                                    Upload replacement
                                    <input
                                      type="file"
                                      className="sr-only"
                                      accept="image/jpeg,image/png,image/webp,application/pdf"
                                      disabled={Boolean(assetOperationPending)}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0];
                                        event.currentTarget.value = '';
                                        if (file) void runAssetUpload(asset.assetId, file);
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </article>
                          );
                        })}

                        {selectedAssets.length === 0 && (
                          <div className="border border-amber-900/50 bg-amber-950/20 p-5 text-xs text-amber-200">
                            No source-manifest assets are registered for this landing.
                          </div>
                        )}

                        <div className="border-t border-slate-800 pt-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400">
                              Replacement audit queue
                            </h4>
                            <span className="text-[9px] font-black uppercase text-slate-600">
                              {selectedAssetReplacementJobs.length} jobs
                            </span>
                          </div>

                          <div className="divide-y divide-slate-800 border-y border-slate-800">
                            {selectedAssetReplacementJobs.map((job) => {
                              const note = assetReviewNotes[job.jobId] || '';
                              const isOwnUpload = job.createdBy === currentUser?.uid;
                              const roleCanReview = job.reviewRequired === 'regulatory'
                                ? canReviewLandingPages
                                : canManageLandingPages;
                              const emergencyReview = currentUser?.claimRole === 'super_admin'
                                && note.trim().length > 0;
                              const canSubmitReview = job.status === 'verified'
                                && roleCanReview
                                && (!isOwnUpload || emergencyReview);
                              const canFinalize = canManageLandingPages
                                && (isOwnUpload || currentUser?.claimRole === 'super_admin')
                                && (job.status === 'upload_pending' || job.status === 'verifying');
                              const statusTone = job.status === 'approved_candidate'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : job.status === 'verified'
                                  ? 'bg-cyan-500/15 text-cyan-300'
                                  : job.status === 'upload_pending' || job.status === 'verifying'
                                    ? 'bg-amber-500/15 text-amber-300'
                                    : 'bg-red-500/15 text-red-300';
                              return (
                                <article key={job.jobId} className="bg-[#0d1220] px-4 py-4">
                                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-1 text-[8px] font-black uppercase ${statusTone}`}>
                                          {job.expired && job.status === 'upload_pending'
                                            ? 'upload expired'
                                            : job.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="bg-slate-800 px-2 py-1 text-[8px] font-black uppercase text-slate-300">
                                          runtime {job.runtimeBindingStatus.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[8px] font-black uppercase text-slate-600">
                                          {job.reviewRequired} review
                                        </span>
                                      </div>
                                      <p className="mt-2 truncate text-xs font-black text-white">
                                        {job.filename}
                                      </p>
                                      <p className="mt-1 break-all font-mono text-[9px] text-slate-500">
                                        {job.assetId} / {job.jobId}
                                      </p>
                                      <div className="mt-3 grid gap-2 text-[9px] text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                                        <span>
                                          Expected <strong className="font-mono text-slate-300">{job.expectedSha256.slice(0, 12)}</strong>
                                        </span>
                                        <span>
                                          Actual <strong className="font-mono text-slate-300">{job.actualSha256?.slice(0, 12) || 'pending'}</strong>
                                        </span>
                                        <span>
                                          Size <strong className="text-slate-300">{formatAssetBytes(job.actualSizeBytes ?? job.expectedSizeBytes)}</strong>
                                        </span>
                                        <span>
                                          Uploader <strong className="break-all font-mono text-slate-300">{job.createdBy || 'unknown'}</strong>
                                        </span>
                                      </div>
                                      {job.reviewedBy && (
                                        <p className="mt-2 text-[9px] text-slate-500">
                                          Reviewed by <span className="font-mono text-slate-300">{job.reviewedBy}</span>
                                        </p>
                                      )}
                                      {job.failureReason && (
                                        <p className="mt-2 text-[9px] font-bold text-red-300">{job.failureReason}</p>
                                      )}
                                    </div>

                                    {canFinalize && onFinalizeAssetReplacement && (
                                      <div className="flex items-start xl:w-[220px] xl:justify-end">
                                        <button
                                          type="button"
                                          disabled={Boolean(assetOperationPending)}
                                          onClick={() => void runAssetFinalize(job.jobId)}
                                          className="inline-flex min-h-9 w-full items-center justify-center gap-2 border border-cyan-800 px-3 py-2 text-[10px] font-black text-cyan-200 disabled:opacity-40 xl:w-auto"
                                        >
                                          {assetOperationPending === `finalize:${job.jobId}`
                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            : <ShieldCheck className="h-3.5 w-3.5" />}
                                          Verify uploaded bytes
                                        </button>
                                      </div>
                                    )}

                                    {job.status === 'verified' && roleCanReview && onReviewAssetReplacement && (
                                      <div className="w-full min-w-0 space-y-2 xl:w-[300px]">
                                        <label className="block text-[8px] font-black uppercase text-slate-600">
                                          Review note
                                          <input
                                            value={note}
                                            maxLength={500}
                                            onChange={(event) => setAssetReviewNotes((previous) => ({
                                              ...previous,
                                              [job.jobId]: event.target.value,
                                            }))}
                                            placeholder={isOwnUpload ? 'Emergency note required' : 'Audit note'}
                                            className="mt-1 h-9 w-full border border-slate-700 bg-slate-950 px-3 text-[10px] font-medium text-slate-200 outline-none focus:border-cyan-700"
                                          />
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            type="button"
                                            disabled={!canSubmitReview || Boolean(assetOperationPending)}
                                            onClick={() => void runAssetReview(job.jobId, 'rejected')}
                                            className="min-h-9 border border-red-800 px-3 py-2 text-[10px] font-black text-red-300 disabled:opacity-40"
                                          >
                                            Reject
                                          </button>
                                          <button
                                            type="button"
                                            disabled={!canSubmitReview || Boolean(assetOperationPending)}
                                            onClick={() => void runAssetReview(job.jobId, 'approved')}
                                            className="inline-flex min-h-9 items-center justify-center gap-1.5 bg-emerald-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-40"
                                          >
                                            {assetOperationPending === `review:${job.jobId}:approved` && (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            )}
                                            Approve candidate
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </article>
                              );
                            })}

                            {selectedAssetReplacementJobs.length === 0 && (
                              <div className="bg-[#0d1220] px-4 py-8 text-center text-[10px] text-slate-500">
                                No replacement jobs for this landing.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {landingDetailTab === 'claims' && (
                      <div className="space-y-3">
                        {selectedClaims.map((claim) => (
                          <article
                            key={claim.claimId}
                            className="grid gap-4 border border-slate-800 bg-[#111625] p-4 lg:grid-cols-[1fr_auto]"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] font-black text-slate-400">
                                  {claim.claimId}
                                </span>
                                <span className={`px-2 py-1 text-[9px] font-black uppercase ${
                                  claim.status === 'approved'
                                    ? 'bg-emerald-500/15 text-emerald-300'
                                    : claim.status === 'rejected'
                                      ? 'bg-red-500/15 text-red-300'
                                      : 'bg-amber-500/15 text-amber-300'
                                }`}>
                                  {claim.status}
                                </span>
                              </div>
                              <p className="mt-2 text-xs font-bold text-white">{claim.claimTextVi}</p>
                              <p className="mt-1 break-all text-[9px] text-slate-500">{claim.sourceDocument}</p>
                            </div>
                            {canReviewLandingPages && claim.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void runLandingCommand({
                                    action: 'review_claim',
                                    claim_id: claim.claimId,
                                    decision: 'rejected',
                                  }, `claim:${claim.claimId}:rejected`)}
                                  className="border border-red-800 px-3 py-2 text-[10px] font-black text-red-300 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  disabled={Boolean(landingUpdatePending)}
                                  onClick={() => void runLandingCommand({
                                    action: 'review_claim',
                                    claim_id: claim.claimId,
                                    decision: 'approved',
                                  }, `claim:${claim.claimId}:approved`)}
                                  className="bg-emerald-600 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              </div>
                            )}
                          </article>
                        ))}
                        {selectedClaims.length === 0 && (
                          <div className="py-8 text-center text-xs text-slate-500">
                            This source-locked version does not reference public claims.
                          </div>
                        )}
                      </div>
                    )}

                    {landingDetailTab === 'referrals' && (
                      <div className="space-y-6">
                        <div className="border border-slate-800 bg-[#111625] p-5 rounded-xl">
                          <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-emerald-400" />
                            One-Level Referral Tree Mappings
                          </h4>
                          <p className="text-[11px] text-slate-400 font-bold mb-4 leading-relaxed">
                            Bản đồ quan hệ người giới thiệu và người được mời của chiến dịch NNC B2B Q3/2026.
                          </p>

                          {(() => {
                            const campaignLeads = leads.filter(l => getLeadCampaignId(l) === 'NNC_B2B_ONLINE_REWARDS_Q3_2026');
                            // Map codes to names
                            const codeToLead = new Map<string, typeof leads[number]>();
                            campaignLeads.forEach(l => {
                              if (l.referral_code_owned) {
                                codeToLead.set(l.referral_code_owned, l);
                              }
                            });

                            // Build referrer trees: map owned_code -> array of leads they invited
                            const referrerTrees = new Map<string, typeof leads>();
                            campaignLeads.forEach(l => {
                              if (l.referral_code_used) {
                                const list = referrerTrees.get(l.referral_code_used) || [];
                                list.push(l);
                                referrerTrees.set(l.referral_code_used, list);
                              }
                            });

                            const referrers = Array.from(referrerTrees.keys());

                            if (referrers.length === 0) {
                              return (
                                <div className="text-center py-8 text-xs text-slate-500 bg-[#0d1220] rounded-xl border border-slate-850">
                                  No referral connections registered in this campaign yet.
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                {referrers.map((refCode) => {
                                  const referrerLead = codeToLead.get(refCode);
                                  const invitees = referrerTrees.get(refCode) || [];
                                  return (
                                    <div key={refCode} className="bg-[#0c0f1b] border border-slate-800 rounded-xl p-4 space-y-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
                                        <div>
                                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Referrer (Người giới thiệu)</span>
                                          <span className="text-xs font-black text-white">
                                            {referrerLead ? (referrerLead.identity?.contact_name || referrerLead.contact_name) : 'Unknown'}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                            {referrerLead ? (referrerLead.identity?.pharmacy_name || referrerLead.pharmacy_name) : 'N/A'}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Referral Code</span>
                                          <span className="text-xs font-mono font-black text-cyan-400">{refCode}</span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                                          Recruited Invitees (Danh sách đã mời: {invitees.length})
                                        </span>
                                        <div className="grid gap-2">
                                          {invitees.map((invitee) => (
                                            <div key={invitee.id} className="flex justify-between items-center bg-[#111625] p-2.5 rounded-lg border border-slate-800/50 text-[10px] font-bold">
                                              <div>
                                                <span className="text-white block font-black">
                                                  {invitee.identity?.contact_name || invitee.contact_name}
                                                </span>
                                                <span className="text-slate-400 block mt-0.5">
                                                  {invitee.identity?.pharmacy_name || invitee.pharmacy_name} | {invitee.identity?.province || invitee.province}
                                                </span>
                                              </div>
                                              <div className="text-right">
                                                <span className="text-slate-400 block font-mono">{invitee.identity?.phone || invitee.phone_number}</span>
                                                <span className="text-emerald-400 block font-black text-[9px] mt-0.5">
                                                  Score: +{invitee.crm?.lead_score || 0} pts
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {landingDetailTab === 'rewards' && (
                      <div className="space-y-6">
                        <div className="border border-slate-800 bg-[#111625] p-5 rounded-xl">
                          <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight flex items-center gap-2">
                            <Gift className="w-4.5 h-4.5 text-amber-400" />
                            Recorded Benefit Groups
                          </h4>
                          <p className="text-[11px] text-slate-400 font-bold mb-4 leading-relaxed">
                            Nhật ký nhóm quyền lợi tham khảo của chiến dịch NNC B2B Q3/2026; NNC xác nhận trước khi áp dụng.
                          </p>

                          {(() => {
                            const campaignLeads = leads.filter(l =>
                              getLeadCampaignId(l) === 'NNC_B2B_ONLINE_REWARDS_Q3_2026' && l.wheel_reward_name
                            );

                            if (campaignLeads.length === 0) {
                              return (
                                <div className="text-center py-8 text-xs text-slate-500 bg-[#0d1220] rounded-xl border border-slate-850">
                                  No benefit groups recorded in this campaign yet.
                                </div>
                              );
                            }

                            return (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[10px] font-bold text-slate-300">
                                  <thead>
                                    <tr className="border-b border-slate-800 text-[9px] font-black uppercase text-slate-500">
                                      <th className="py-2.5 px-3">Participant (Cơ sở)</th>
                                      <th className="py-2.5 px-3">Contact</th>
                                      <th className="py-2.5 px-3">Benefit group</th>
                                      <th className="py-2.5 px-3">Status</th>
                                      <th className="py-2.5 px-3 text-right">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {campaignLeads.map((lead) => (
                                      <tr key={lead.id} className="border-b border-slate-800/60 hover:bg-slate-800/10">
                                        <td className="py-3 px-3">
                                          <span className="text-white block font-black">
                                            {lead.identity?.pharmacy_name || lead.pharmacy_name || 'N/A'}
                                          </span>
                                          <span className="text-slate-500 text-[9px] block mt-0.5">
                                            {lead.identity?.province || lead.province}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3">
                                          <span className="text-slate-200 block">
                                            {lead.identity?.contact_name || lead.contact_name}
                                          </span>
                                          <span className="text-slate-500 font-mono text-[9px] block mt-0.5">
                                            {lead.identity?.phone || lead.phone_number}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3">
                                          <span className="text-amber-400 font-black block">
                                            {lead.wheel_reward_name}
                                          </span>
                                          <span className="text-slate-500 text-[9px] block mt-0.5 font-mono">
                                            ID: {lead.wheel_reward_id}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3">
                                          <span className={`block font-black ${lead.wheel_reward_status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {lead.wheel_reward_status === 'approved' ? 'Approved' : 'Provisional'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-slate-400">
                                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* TAB 2: ACQUISITION */}
          {activeTab === 'acquisition' && canViewAnalytics && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white font-display">Acquisition Performance Channels</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {acquisitionUsesStats
                    ? 'Source totals use the daily read model; qualified counts use loaded CRM details.'
                    : acquisitionUsesGa4
                      ? `GA4 sessions and active users · ${landingAnalytics?.date_from} to ${landingAnalytics?.date_to}.`
                    : 'Source tracking uses the bounded CRM detail window for the current filters.'}
                </p>
              </div>

              <div className="bg-[#0E1322] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 text-xs font-black uppercase tracking-wider border-b border-slate-800">
                      <th className="p-4">{acquisitionUsesStats ? 'Source' : 'Source / Medium'}</th>
                      <th className="p-4 text-right">{acquisitionUsesGa4 ? 'Active Users' : 'Qualified (loaded)'}</th>
                      <th className="p-4 text-right">{acquisitionUsesGa4 ? 'Sessions' : 'Total Leads'}</th>
                      <th className="p-4 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 font-medium">
                    {(() => {
                      if (acquisitionRows.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">No acquisition data available.</td>
                          </tr>
                        );
                      }

                      return acquisitionRows.map((row, idx) => {
                        const acquisitionDenominator = acquisitionUsesGa4
                          ? ga4Totals.sessions
                          : displayedLeadCount;
                        const pct = acquisitionDenominator > 0
                          ? ((row.total / acquisitionDenominator) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4 font-mono text-white">{row.source}</td>
                            <td className="p-4 text-right font-bold text-amber-500">{row.qualified}</td>
                            <td className="p-4 text-right font-bold text-emerald-400">{row.total}</td>
                            <td className="p-4 text-right font-black text-slate-400">{pct}%</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LEADS DIRECTORY */}
          {activeTab === 'leads' && canViewLeadCrm && (
            <div className="space-y-6">
              {canViewIntegrationOperations
                && onRefreshIntegration
                && onIntegrationCommand
                && onLoadDeliveryDetail && (
                  <React.Suspense fallback={(
                    <div className="h-28 animate-pulse rounded-2xl border border-slate-800 bg-[#0E1322]" />
                  )}>
                    <LeadDeliveryOperations
                      workspace={integrationWorkspace}
                      loadState={integrationLoadState}
                      onRefresh={onRefreshIntegration}
                      onCommand={onIntegrationCommand}
                      onLoadDetail={onLoadDeliveryDetail}
                    />
                  </React.Suspense>
                )}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white font-display">Pharmacy Leads Directory</h3>
                  <p className="text-slate-400 text-xs mt-0.5">High-density leads list showing operational parameters and attribution details.</p>
                </div>
                {currentUser?.role !== 'Sales Rep' && filteredLeads.length > 0 && (
                  <button onClick={exportLeadsCsv} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black rounded-xl transition shadow-xs cursor-pointer">
                    <Download className="w-4 h-4 text-emerald-450" />
                    <span>{t.exportCsv}</span>
                  </button>
                )}
              </div>

              {/* Grid search filters */}
              <div className="bg-[#0E1322] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-500 focus:ring-0"
                  />
                </div>

                <div className="overflow-x-auto">
                  {filteredLeads.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-700" />
                      <p>{t.noLeads}</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-xs font-black uppercase tracking-wider border-b border-slate-800">
                          <th className="p-4">Landing / Campaign</th>
                          <th className="p-4">{t.tablePharmacy}</th>
                          <th className="p-4">{t.tableContact}</th>
                          <th className="p-4">Nhu cầu / Sản phẩm</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs text-slate-350 font-bold">
                        {filteredLeads.map((lead) => {
                          const campaignId = getLeadCampaignId(lead);
                          const leadType = getLeadType(lead);
                          const isWhiteLotus = campaignId.includes('WL_') || campaignId.includes('WHITE_LOTUS');
                          const items = lead.selection?.items || [];

                          return (
                          <tr key={lead.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4">
                              <span className="font-black text-[10px] uppercase text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">{getLeadLandingId(lead)}</span>
                              <span className="text-[9px] text-slate-400 font-mono block mt-1">{campaignId}</span>
                              <span className="text-[9px] text-slate-500 font-mono block">Type: {leadType}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-extrabold text-white block">{lead.identity?.pharmacy_name || lead.pharmacy_name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {lead.id.slice(0, 8)}</span>
                            </td>
                            <td className="p-4">
                              <span className="block text-slate-200">{lead.identity?.contact_name || lead.contact_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{lead.identity?.phone || lead.phone_number}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] text-slate-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {getProvinceLaoName(lead.identity?.province || lead.province || '')}
                              </span>
                            </td>
                            <td className="p-4">
                              {isWhiteLotus ? (
                                <div className="space-y-1">
                                  {items.length > 0 ? items.map((item, i) => (
                                    <div key={i} className="text-slate-300 text-[10px]">
                                      <span className="text-white font-bold">{item.product_id}</span> x{item.quantity}
                                    </div>
                                  )) : (
                                    <span className="text-slate-500 text-[10px] italic">No items (Sample Request)</span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="block text-slate-200">
                                    {['COMBO_1M', 'advanced'].includes(getLeadPackage(lead)) ? '⭐️ Gói 1,000,000 LAK' :
                                     ['COMBO_500K', 'basic'].includes(getLeadPackage(lead)) ? ' Gói 500,000 LAK' : (getLeadPackage(lead) || 'Gói tùy chọn')}
                                  </span>
                                  <span className="text-[9px] text-slate-500 block font-medium mt-0.5">
                                    Thưởng: {['CASH', 'cash'].includes(getLeadReward(lead)) ? 'Nhận Tiền mặt' :
                                           ['IN_KIND', 'product'].includes(getLeadReward(lead)) ? 'Nhận Ống sủi' : 'Không tham gia'}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight uppercase ${getStatusColor(getLeadStatus(lead))}`}>
                                {getLeadStatus(lead)}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Open Details Drawer */}
                                <button onClick={() => handleOpenLeadDrawer(lead)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1 cursor-pointer">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>

                                {!readOnlyMode && onDeleteLead && <button
                                  disabled={currentUser?.role !== 'Admin'}
                                  onClick={() => {
                                    if (window.confirm(t.deleteConfirm)) {
                                      onDeleteLead(lead.id);
                                    }
                                  }}
                                  className={`p-1.5 rounded transition ${currentUser?.role !== 'Admin' ? 'text-slate-600 opacity-30 cursor-not-allowed' : 'text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer'}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>}
                              </div>
                            </td>
                          </tr>
                          ); })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SALES PIPELINE */}
          {activeTab === 'pipeline' && canViewLeadCrm && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white font-display">Sales Pipeline Progression</h3>
                <p className="text-slate-400 text-xs mt-0.5">B2B Leads mapped across pipeline lifecycle columns.</p>
              </div>

              {/* Kanban Column View */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
                {[
                  { name: 'NEW (Mới)', status: 'NEW' },
                  { name: 'WORKING (Đang liên hệ)', status: 'WORKING' },
                  { name: 'QUALIFIED (Đạt tiêu chuẩn)', status: 'QUALIFIED' },
                  { name: 'WON (Chốt đơn)', status: 'WON' }
                ].map((col, idx) => {
                  const colLeads = filteredLeads.filter(l => getLeadStatus(l) === col.status);
                  return (
                    <div key={idx} className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-w-[240px]">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{col.name}</span>
                        <span className="px-2 py-0.5 bg-slate-900 rounded text-[10px] text-slate-400 font-bold border border-slate-800">{colLeads.length}</span>
                      </div>
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px]">
                        {colLeads.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-4 text-[10px] text-slate-500 font-bold">
                            No active leads in this stage
                          </div>
                        ) : (
                          colLeads.map(lead => (
                            <div key={lead.id} onClick={() => handleOpenLeadDrawer(lead)} className="p-3 bg-[#0E1322] border border-slate-850 rounded-xl hover:border-emerald-600 cursor-pointer transition space-y-2">
                              <span className="text-xs font-extrabold text-white block leading-tight">{lead.identity?.pharmacy_name || lead.pharmacy_name}</span>
                              <div className="flex items-center justify-between text-[9px] text-slate-400">
                                <span>{lead.identity?.province || lead.province}</span>
                                <span className="font-mono text-emerald-400 font-black">{(getLeadValue(lead) || 500000).toLocaleString()} LAK</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white font-display">Lead CRM Settings</h3>
                <p className="text-slate-400 text-xs mt-0.5">Read-only Firestore access for authorized NNC staff.</p>
              </div>

              <div className="bg-[#0E1322] border border-slate-800 rounded-2xl p-5 space-y-4 max-w-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white block">ENABLE_MEDICAL_CLAIMS Feature Flag</span>
                    <span className="text-[10px] text-slate-500 font-medium">Gated science claims are currently locked at build time.</span>
                  </div>
                  <span className="px-2 py-1 bg-red-950 text-red-400 border border-red-900 text-[10px] font-black rounded uppercase">LOCKED_FALSE</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">Firebase Analytics / GA4</span>
                    <span className="text-[10px] text-slate-500 font-medium">Click, page-view and engagement reports are intentionally outside this Lead CRM.</span>
                  </div>
                  <a
                    href="https://console.firebase.google.com/project/nnccampaignplatformproduction/analytics"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60"
                  >
                    Open Analytics <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* DETAILED INTERACTIVE LEAD DRAWER */}
      {selectedLead && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0D121F] border-l border-slate-800/80 shadow-2xl z-[100] flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-450" />
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">View Pharmacy Lead</h4>
                <span className="text-[10px] text-slate-500 font-mono">ID: {selectedLead.id}</span>
              </div>
            </div>
            <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white text-lg font-black cursor-pointer">
              ✕
            </button>
          </div>

          {/* Drawer Body - Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs font-bold">
            
            {/* SLA Timer Indicator */}
            <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-350">SLA Age Timer</span>
              </div>
              <span className="text-emerald-400 font-mono">
                {Math.max(0, Math.floor((new Date().getTime() - new Date(selectedLead.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days
              </span>
            </div>

            {/* Static Pharmacy Info */}
            <div className="space-y-2 bg-[#080B10] p-4 border border-slate-850 rounded-xl text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Landing Page</span>
                <span className="text-emerald-400">{getLeadLandingId(selectedLead)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Campaign / Source</span>
                <span className="text-emerald-400">{getLeadCampaignId(selectedLead)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Form contract</span>
                <span className="text-right font-mono text-cyan-300">
                  {selectedLead.form?.contract_id || 'legacy / unknown'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Contact basis</span>
                <span className="text-right text-slate-300">
                  {(selectedLead.compliance?.contact_basis || 'legacy / unknown').replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Pharmacy Name</span>
                <span className="text-white">
                  {selectedLead.identity?.pharmacy_name || selectedLead.pharmacy_name || 'Not supplied'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Contact Name</span>
                <span className="text-white">{selectedLead.identity?.contact_name || selectedLead.contact_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Phone / Tel</span>
                <span className="text-white font-mono">{selectedLead.identity?.phone || selectedLead.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Province</span>
                <span className="text-white">{getProvinceLaoName(selectedLead.identity?.province || selectedLead.province || '')}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Requirement / Selection</span>
                {(selectedLead.selection?.items && selectedLead.selection.items.length > 0) ? (
                  <div className="space-y-1">
                    {selectedLead.selection.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-400">{item.product_id}</span>
                        <span className="text-white">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Combo Option</span>
                      <span className="text-white">{getLeadPackage(selectedLead)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Display Reward</span>
                      <span className="text-white">{getLeadReward(selectedLead)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Q3 Online Rewards Campaign details */}
            {getLeadCampaignId(selectedLead) === 'NNC_B2B_ONLINE_REWARDS_Q3_2026' && (
              <div className="space-y-2 bg-[#080B10] p-4 border border-slate-850 rounded-xl text-slate-350 font-bold text-xs">
                <span className="text-amber-400 font-black uppercase tracking-wider text-[9px]">Q3 Campaign Details</span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Participant Role:</span>
                  <span className="text-white font-black capitalize">{selectedLead.role || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Category Interest:</span>
                  <span className="text-white font-black capitalize">{selectedLead.category_interest || 'N/A'}</span>
                </div>
                {selectedLead.product_interests && selectedLead.product_interests.length > 0 && (
                  <div className="flex justify-between text-xs gap-4">
                    <span className="text-slate-500 shrink-0">Product Interests:</span>
                    <span className="text-white font-black text-right truncate">
                      {selectedLead.product_interests.join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Expected Purchase:</span>
                  <span className="text-white font-black">{selectedLead.purchase_intent_range || 'N/A'}</span>
                </div>
                {selectedLead.support_needs && selectedLead.support_needs.length > 0 && (
                  <div className="flex justify-between text-xs gap-4">
                    <span className="text-slate-500 shrink-0">Support Needs:</span>
                    <span className="text-white font-black text-right truncate">
                      {selectedLead.support_needs.join(', ')}
                    </span>
                  </div>
                )}
                {selectedLead.referral_code_used && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Referrer Code Used:</span>
                    <span className="text-white font-mono text-cyan-400">{selectedLead.referral_code_used}</span>
                  </div>
                )}
                {selectedLead.referral_code_owned && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Owned Referral Code:</span>
                    <span className="text-white font-mono text-emerald-400">{selectedLead.referral_code_owned}</span>
                  </div>
                )}
                {selectedLead.wheel_reward_name && (
                  <div className="flex justify-between text-xs gap-4">
                    <span className="text-slate-500 shrink-0">Recorded Benefit Group:</span>
                    <span className="text-amber-400 font-black text-right">
                      {selectedLead.wheel_reward_name}
                    </span>
                  </div>
                )}
                {selectedLead.wheel_reward_status && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Benefit Status:</span>
                    <span className={selectedLead.wheel_reward_status === 'approved' ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                      {selectedLead.wheel_reward_status === 'approved' ? 'Approved' : 'Provisional'}
                    </span>
                  </div>
                )}
                {selectedLead.whatsapp_click_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">WhatsApp Contact At:</span>
                    <span className="text-white font-mono">{new Date(selectedLead.whatsapp_click_at).toLocaleString()}</span>
                  </div>
                )}
                {selectedLead.whatsapp_click_count !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">WhatsApp Click Count:</span>
                    <span className="text-white font-mono">{selectedLead.whatsapp_click_count}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-black">Lead Campaign Score:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black">
                    +{selectedLead.crm?.lead_score || 0} pts
                  </span>
                </div>
              </div>
            )}

            {currentUser?.role !== 'Sales Rep' && (
              <div className="space-y-3 bg-[#080B10] p-4 border border-slate-850 rounded-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      AI-safe feature snapshot
                    </span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-mono">No contact PII</span>
                </div>

                {leadFeatureState === 'loading' && (
                  <p className="text-[10px] text-slate-500">Loading the redacted feature document...</p>
                )}

                {leadFeatureState === 'missing' && (
                  <p className="text-[10px] text-amber-400">
                    No feature document exists for this lead. Legacy leads require a controlled backfill.
                  </p>
                )}

                {leadFeatureState === 'ready' && leadFeature && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                    <div>
                      <span className="text-slate-600 block">Lead type</span>
                      <span className="text-slate-300">{leadFeature.lead_type || 'unknown'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">CRM feature state</span>
                      <span className="text-slate-300">{leadFeature.crm_status || 'NEW'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Form flow</span>
                      <span className="text-slate-300">{leadFeature.flow_key || 'unknown'}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Contact basis</span>
                      <span className="text-slate-300">
                        {(leadFeature.contact_basis || 'unknown').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Items / quantity</span>
                      <span className="text-slate-300">
                        {leadFeature.selection?.item_count || 0} / {leadFeature.selection?.total_quantity || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Phone signal</span>
                      <span className="text-slate-300">{leadFeature.phone_present ? 'present' : 'not present'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600 block">Feature freshness</span>
                      <span className="text-slate-300 font-mono">
                        {leadFeature.created_at?.slice(0, 16).replace('T', ' ') || 'unknown'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edit fields form */}
            <div className="space-y-4 pt-2 border-t border-slate-850">
              {/* 1. Status Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Lead Qualification State</label>
                <select 
                  value={drawerStatus} 
                  onChange={(e) => setDrawerStatus(e.target.value as LeadStatus)}
                  disabled={readOnlyMode}
                  className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 outline-none cursor-pointer"
                >
                  <option value="NEW">NEW (Mới đăng ký)</option>
                  <option value="CONTACT_PENDING">CONTACT_PENDING (Đang chuẩn bị gọi)</option>
                  <option value="WORKING">WORKING (Đang liên hệ trao đổi)</option>
                  <option value="QUALIFIED">QUALIFIED (Đạt tiêu chuẩn trưng bày)</option>
                  <option value="ORDER_PENDING">ORDER_PENDING (Chờ xuất kho hàng sỉ)</option>
                  <option value="WON">WON (Thành công - Đã ký cam kết)</option>
                  <option value="LOST">LOST (Thất bại / Không đồng ý)</option>
                  <option value="INVALID">INVALID (Sai thông tin / Trùng lặp)</option>
                </select>
              </div>

              {/* 2. Assignee rep dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Assignee rep</label>
                <select 
                  value={drawerOwner} 
                  onChange={(e) => setDrawerOwner(e.target.value)}
                  disabled={readOnlyMode}
                  className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 outline-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  <option value="somphone.sales@nnc.la">Somphone (Sales Savannakhet)</option>
                  <option value="keo.sales@nnc.la">Keo (Sales Vientiane Capital)</option>
                  <option value="anousone.sales@nnc.la">Anousone (Sales Luang Prabang)</option>
                </select>
              </div>

              {/* 3. Next action due date */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Next action at</label>
                <input
                  type="datetime-local"
                  value={drawerNextAction}
                  onChange={(e) => setDrawerNextAction(e.target.value)}
                  disabled={readOnlyMode}
                  className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 font-mono outline-none"
                />
              </div>

              {/* 3. Estimated Value */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Estimated Value (LAK)</label>
                <input 
                  type="number" 
                  value={drawerValue} 
                  onChange={(e) => setDrawerValue(Number(e.target.value))}
                  disabled={readOnlyMode}
                  className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 font-mono outline-none"
                  placeholder="Estimated pipeline value"
                />
              </div>

              {/* 4. Lost Reason - conditional field */}
              {drawerStatus === 'LOST' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Lost Reason</label>
                  <select 
                    value={drawerLostReason} 
                    onChange={(e) => setDrawerLostReason(e.target.value)}
                    disabled={readOnlyMode}
                    className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="">Select a reason</option>
                    <option value="NO_SPACE">Không đủ diện tích quầy thanh toán</option>
                    <option value="LOW_MARGIN">Tỷ lệ chiết khấu sỉ chưa hấp dẫn</option>
                    <option value="NOT_INTERESTED">Không muốn cam kết trưng bày 3 tháng</option>
                    <option value="NO_RESPONSE">Gọi điện không nhấc máy nhiều lần</option>
                  </select>
                </div>
              )}

              {/* 5. Notes / Remarks */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Internal remarks / conversion reasons</label>
                <textarea 
                  value={drawerNotes} 
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  disabled={readOnlyMode}
                  className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-300 outline-none font-medium h-20"
                  placeholder="Enter custom comments, action items..."
                />
              </div>
              {/* Q3 Online Rewards specific admin overrides */}
              {getLeadCampaignId(selectedLead) === 'NNC_B2B_ONLINE_REWARDS_Q3_2026' && (
                <div className="border-t border-slate-800 pt-3 mt-3 space-y-3">
                  <span className="text-amber-400 font-black uppercase tracking-wider text-[9px] block">Q3 Admin Overrides</span>
                  {/* Wheel reward override */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wheel Reward Won</label>
                    <input
                      type="text"
                      value={drawerRewardOverride}
                      onChange={(e) => setDrawerRewardOverride(e.target.value)}
                      disabled={readOnlyMode}
                      className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-350 outline-none"
                      placeholder="e.g. Free sample kit"
                    />
                  </div>

                  {/* Referral code used override */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Referrer Code Used</label>
                    <input
                      type="text"
                      value={drawerReferralOverride}
                      onChange={(e) => setDrawerReferralOverride(e.target.value)}
                      disabled={readOnlyMode}
                      className="w-full bg-[#141B2D] border border-slate-800 rounded-xl p-3 text-slate-350 outline-none font-mono"
                      placeholder="e.g. NNC-DR-12345"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Audit Logs Trail */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Audit trail logs</label>
              <div className="bg-[#080B10] p-3 rounded-xl border border-slate-850 font-mono text-[9px] text-slate-400 space-y-1 leading-normal max-h-[100px] overflow-y-auto">
                {drawerLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Actions */}
          <div className="p-5 border-t border-slate-800 bg-[#0A0E1A] flex items-center justify-end gap-2">
            <button 
              onClick={() => setSelectedLead(null)}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-black rounded-xl transition"
            >
              Cancel
            </button>
            {!readOnlyMode && <button
              onClick={handleSaveDrawerDetails}
              disabled={isSavingDrawer}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingDrawer ? 'Saving...' : 'Save Changes'}</span>
            </button>}
          </div>
        </div>
      )}

    </div>
  );
}
