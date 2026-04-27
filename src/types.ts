export interface Deal {
  siteName: string;
  price: number;
  currency: string;
  url: string;
  stockStatus: string;
  deliveryInfo: string;
  isBestDeal?: boolean;
}

export interface AppSpecs {
  location: string;
  condition: 'New' | 'Any';
  sitesToSkip: string[];
}

export interface ComparisonResult {
  deals: Deal[];
  summary: string;
  rawResponse?: string;
}
