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

export interface AggregatedStats {
  totalImpressions: number;
  totalClicks: number;
  totalMoney: number;
  avgCpm: number;
  avgCtr: number;
  activeDays: number;
}

export type DatePreset = '7d' | '30d' | 'all' | 'custom';
