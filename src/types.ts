export interface SiteItem {
  id: number;
  url: string;
  user_verification_status: number;
}

export interface ZoneItem {
  id: number;
  site_id: number;
  direction_id: number;
  site_direction_id: number;
  zone_type_id: number | null;
  multitag: boolean;
  title: string;
  is_anti_ad_block: number;
}

export interface CountryItem {
  id: number;
  value: string; // ISO 2-letter code e.g. "us", "bd"
  title: string; // e.g. "United States", "Bangladesh"
}

export interface StatItem {
  date_time?: string;
  site_id?: string | number;
  zone_id?: string | number;
  country_id?: string | number;
  os_id?: string | number;
  prerequests?: string | number;
  requests?: string | number;
  impressions?: string | number;
  clicks?: string | number;
  conversions?: string | number;
  subscriptions?: string | number;
  money?: string | number;
  push_already_subscribed?: string | number;
  push_first_impressions?: string | number;
  push_unsubscriptions?: string | number;
  conversions2?: string | number;
  conversions3?: string | number;
}

export interface StatisticsResponse {
  result: StatItem[];
  meta: {
    total_items: number;
    total_pages: number;
    page_size: number;
    page: number;
  };
}

export interface AggregatedStats {
  totalImpressions: number;
  totalRequests: number;
  totalClicks: number;
  totalConversions: number;
  totalMoney: number;
  avgCpm: number;
  avgCtr: number;
  fillRate: number;
  activeDays: number;
}

export type DatePreset = '7d' | '30d' | 'all' | 'custom';
