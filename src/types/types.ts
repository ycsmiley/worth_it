export interface Product {
  id: string;
  name: string;
  category: string;
  overview: string;
  priceRange?: string;
  pros: string[];
  cons: string[];
  marketSentiment: {
    score: number;
    description: string;
  };
  bestFor: string[];
  considerations: string[];
  tags: ('price' | 'features' | 'reviews')[];
  comparableProducts?: {
    name: string;
    keyDifferenceOrBenefit: string;
    approxPriceRange?: string;
  }[];
}

export interface Recommendation {
  productName: string;
  category: string;
  keyFeatures: string[];
  approxPriceNTD: string;
  reasonWhySuitable?: string;
  keyConsideration?: string;
}

export interface RecommendationResponse {
  queryType: 'recommendation_v1' | 'recommendation_v2';
  originalQueryDetails?: {
    targetUser?: string;
    specificNeeds?: string[];
    priceRange?: string;
  };
  recommendations: Recommendation[];
}

export type FilterTag = 'price' | 'features' | 'reviews' | null;

export interface AnalysisHistory {
  id: string;
  created_at: string;
  query: string;
  filter: FilterTag;
  result: Product;
  user_id?: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
  } | null;
}