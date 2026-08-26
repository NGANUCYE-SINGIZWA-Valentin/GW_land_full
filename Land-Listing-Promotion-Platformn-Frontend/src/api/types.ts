export type BackendRole = 'admin' | 'sub_admin' | 'seller' | 'buyer';
export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface BackendUser {
  id: string;
  role: BackendRole;
  full_name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  photo_url: string | null;
  is_verified: boolean;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
  last_login_at?: string | null;
}

export type PaymentProvider = 'momo' | 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PaymentType = 'listing_fee' | 'featured_placement' | 'subscription';
export type PlanKey = 'listing_fee' | 'featured_placement' | 'subscription_monthly';

export interface PricingPlan {
  id: string;
  plan_key: PlanKey;
  label: string;
  description: string | null;
  amount_rwf: string;
  amount_usd: string | null;
  billing_cycle: 'one_time' | 'monthly' | null;
  is_active: boolean;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  listing_id: string | null;
  amount: string;
  currency: 'RWF' | 'USD';
  payment_type: PaymentType;
  provider: PaymentProvider;
  reference_note: string | null;
  confirmed_by: string | null;
  plan_key: PlanKey;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  listing_title?: string | null;
}

export interface AdminPayment extends Payment {
  user_name: string;
  user_email: string;
}

export interface RevenueSummary {
  total_rwf: string;
  total_usd: string;
  pending_count: string;
  completed_count: string;
  by_type: { payment_type: PaymentType; count: string; total_rwf: string }[];
  revenue_by_day: { day: string; total_rwf: string }[];
}

export interface ActivityEntry {
  id: string;
  action: string;
  detail: string | null;
  created_at: string;
}

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'sold';
export type SizeUnit = 'sqm' | 'hectare';
export type TenureType = 'freehold' | 'leasehold' | 'customary';
export type LandUseType = 'residential' | 'commercial' | 'agricultural' | 'mixed';
export type ReportReasonCategory = 'fraudulent' | 'incorrect_info' | 'already_sold' | 'inappropriate' | 'duplicate' | 'other';

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  price_rwf: string | null;
  price_usd: string | null;
  size_value: string;
  size_unit: SizeUnit;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  created_at: string;
  district: string;
  sector: string;
  cover_image: string | null;
}

export interface ListingDetail {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  district_id: number;
  sector_id: number;
  district: string;
  sector: string;
  latitude: string | null;
  longitude: string | null;
  price_rwf: string | null;
  price_usd: string | null;
  size_value: string;
  size_unit: SizeUnit;
  upi: string | null;
  upi_verified: boolean;
  tenure_type: TenureType | null;
  land_use: LandUseType | null;
  has_road_access: boolean;
  has_water: boolean;
  has_electricity: boolean;
  status: ListingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  images: string[];
  seller?: {
    full_name: string;
    phone: string | null;
    whatsapp_number: string | null;
    is_verified: boolean;
  };
}

export interface MyListing extends Omit<ListingDetail, 'images' | 'seller'> {
  images?: string[];
  cover_image: string | null;
}

export interface AdminListing extends MyListing {
  seller_name: string;
  seller_email: string;
}

export interface PaginatedListings<T> {
  listings: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Province {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  province?: string;
}

export interface Sector {
  id: number;
  name: string;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  receiver_name: string;
  listing_title: string | null;
  listing_slug: string | null;
  unread_count: string;
}

export interface AdminConversation extends Omit<Conversation, 'unread_count'> {
  message_count: string;
}

export interface Message {
  id: string;
  listing_id: string | null;
  sender_id: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string | null;
  reporter_email: string | null;
  reason_category: ReportReasonCategory;
  reason: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  listing_title: string | null;
  listing_slug: string | null;
}

export interface AdminNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DailyCount {
  day: string;
  count: string;
}

export interface Analytics {
  total_users: number;
  listings: {
    total: string;
    active: string;
    pending: string;
    sold: string;
  };
  most_viewed_listings: { id: string; title: string; slug: string; view_count: number }[];
  listings_by_day: DailyCount[];
  users_by_day: DailyCount[];
  total_messages: number;
  total_reports: number;
  total_favorites: number;
}
