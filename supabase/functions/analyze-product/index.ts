import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const SUPPORTED_LANGUAGES = ['zh', 'en'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ComparableProduct {
  name: string;
  keyDifferenceOrBenefit: string;
  approxPriceRange?: string;
}

interface ProductAnalysis {
  name: string;
  category: string;
  queryType?: 'analysis' | 'recommendation_v1';
  priceRange?: string;
  overview: string;
  pros: string[];
  cons: string[];
  marketSentiment: {
    score: number;
    description: string;
  };
  bestFor: string[];
  considerations: string[];
  tags: string[];
  comparableProducts?: ComparableProduct[];
}

interface RecommendationResponse {
  queryType: 'recommendation_v1' | 'recommendation_v2';
  originalQueryDetails?: {
    targetUser?: string;
    specificNeeds?: string[];
    priceRange?: string;
  };
  recommendations: Recommendation[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY") || "";
const MAX_QUERY_LENGTH = 500;

function normalizeLanguage(lang: string | undefined): SupportedLanguage {
  if (!lang) return 'zh';

  // Extract base language code (e.g., 'zh-TW' -> 'zh')
  const baseLanguage = lang.split('-')[0].toLowerCase();
  
  // Default to 'zh' if not supported
  return SUPPORTED_LANGUAGES.includes(baseLanguage as SupportedLanguage) 
    ? (baseLanguage as SupportedLanguage) 
    : 'zh';
}

function getFilterPrompt(filter: string | string[] | null, language: SupportedLanguage): string {
  if (!filter) return "";

  const filters = Array.isArray(filter) ? filter : [filter];
  
  if (language === 'zh') {
    const filterMap = {
      price: "價格和CP值",
      features: "功能和使用體驗",
      reviews: "使用者評價和口碑"
    };
    
    const filterTexts = filters.map(f => filterMap[f as keyof typeof filterMap]);
    return `請特別著重分析以下面向：${filterTexts.join("、")}。`;
  }
  
  const filterMap = {
    price: "price and value for money",
    features: "features and user experience",
    reviews: "user reviews and market reception"
  };
  
  const filterTexts = filters.map(f => filterMap[f as keyof typeof filterMap]);
  return `Please focus particularly on: ${filterTexts.join(", ")}.`;
}

async function queryPerplexity(query: string, filter: string | string[] | null, language: string, type: 'analysis' | 'recommendation'): Promise<PerplexityResponse> {
  try {
    if (!query.trim()) {
      throw new Error("Query cannot be empty");
    }

    const sanitizedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
    const normalizedLanguage = normalizeLanguage(language);

    console.log("Querying Perplexity API with:", { 
      query: sanitizedQuery,
      filter,
      language: normalizedLanguage,
      queryLength: sanitizedQuery.length 
    });
    
    const filterPrompt = getFilterPrompt(filter, normalizedLanguage);
    const isRecommendation = type === 'recommendation';

    const systemPrompt = normalizedLanguage === 'zh'
      ? isRecommendation
        ? `你是一位專業的台灣市場產品推薦專家。你的任務是根據使用者的需求，推薦2-3款最適合的產品選擇。

回應必須是一個單一、完整且有效的 JSON 物件，其結構如下：
{
  "queryType": "recommendation_v2",
  "originalQueryDetails": {
    "targetUser": "從使用者提示中理解到的目標使用者",
    "specificNeeds": ["需求1", "需求2"],
    "priceRange": "價格範圍要求（如果有）"
  },
  "recommendations": [
    {
      "productName": "產品完整名稱",
      "category": "產品類別",
      "keyFeatures": ["特色1", "特色2", "特色3"],
      "approxPriceNTD": "價格範圍（新台幣）",
      "reasonWhySuitable": "為何適合使用者",
      "keyConsideration": "購買前重要提醒"
    }
  ]
}

重要提示：
1. 直接回傳此 JSON 物件，不要加入任何其他文字。
2. 所有產品必須是台灣市面上可買到的。
3. 價格必須是實際的新台幣範圍。
4. keyFeatures 必須是字串陣列。
${filterPrompt}`
        : `你是一位專業的產品分析專家。請針對使用者詢問的產品進行深入分析。

回應必須是一個單一、完整且有效的 JSON 物件，其結構如下：
{
  "name": "產品完整名稱",
  "category": "產品類別",
  "priceRange": "價格範圍（新台幣）",
  "overview": "產品概述",
  "pros": ["優點1", "優點2", "優點3"],
  "cons": ["缺點1", "缺點2"],
  "marketSentiment": {
    "score": 評分（1-10）,
    "description": "市場評價描述"
  },
  "bestFor": ["最適合的使用場景1", "場景2"],
  "considerations": ["購買考量1", "考量2"],
  "tags": ["price", "features", "reviews"],
  "comparableProducts": [
    {
      "name": "競品名稱",
      "keyDifferenceOrBenefit": "主要差異或優勢",
      "approxPriceRange": "價格範圍"
    }
  ]
}

重要提示：
1. 直接回傳此 JSON 物件，不要加入任何其他文字。
2. 所有資訊必須基於實際市場資料。
3. 價格必須是實際的新台幣範圍。
${filterPrompt}`
      : isRecommendation
        ? `You are a professional product recommendation expert. Your task is to recommend 2-3 most suitable products based on user requirements.

Response must be a single, complete, and valid JSON object with the following structure:
{
  "queryType": "recommendation_v2",
  "originalQueryDetails": {
    "targetUser": "target user understood from prompt",
    "specificNeeds": ["need1", "need2"],
    "priceRange": "price range requirement if any"
  },
  "recommendations": [
    {
      "productName": "full product name",
      "category": "product category",
      "keyFeatures": ["feature1", "feature2", "feature3"],
      "approxPriceNTD": "price range in NTD",
      "reasonWhySuitable": "why suitable for user",
      "keyConsideration": "important note before purchase"
    }
  ]
}

Important notes:
1. Return only this JSON object without any additional text.
2. All products must be available in Taiwan market.
3. Prices must be actual ranges in NTD.
4. keyFeatures must be an array of strings.
${filterPrompt}`
        : `You are a professional product analysis expert. Please provide an in-depth analysis of the product in question.

Response must be a single, complete, and valid JSON object with the following structure:
{
  "name": "full product name",
  "category": "product category",
  "priceRange": "price range in NTD",
  "overview": "product overview",
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "marketSentiment": {
    "score": rating (1-10),
    "description": "market sentiment description"
  },
  "bestFor": ["best use case1", "case2"],
  "considerations": ["consideration1", "consideration2"],
  "tags": ["price", "features", "reviews"],
  "comparableProducts": [
    {
      "name": "competitor name",
      "keyDifferenceOrBenefit": "main difference or advantage",
      "approxPriceRange": "price range"
    }
  ]
}

Important notes:
1. Return only this JSON object without any additional text.
2. All information must be based on actual market data.
3. Prices must be actual ranges in NTD.
${filterPrompt}`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: sanitizedQuery,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in queryPerplexity:", error);
    throw error;
  }
}

function removeCitationMarkers(text: string): string {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/\[\d+(?:[-,]\d+)*\](?:\[\d+\])?/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function cleanObjectStrings(obj: any): any {
  if (typeof obj === 'string') {
    const cleaned = removeCitationMarkers(obj);
    return cleaned.replace(/\[(?:ref|cite|source|[\d\s,\-])+\]/gi, '').trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item));
  }
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanObjectStrings(value);
    }
    return cleaned;
  }
  return obj;
}

function extractJsonFromText(text: string): string | null {
  // Try to find JSON object with optional markdown code fence
  const patterns = [
    /```(?:json)?\s*(\{[\s\S]*?\})\s*```/, // Markdown fenced JSON
    /(\{[\s\S]*?\})/,                      // Any JSON-like structure
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      try {
        // Verify it's valid JSON
        JSON.parse(match[1].trim());
        return match[1].trim();
      } catch (e) {
        console.log(`Failed to parse potential JSON match: ${e.message}`);
        continue;
      }
    }
  }

  return null;
}

function parseAnalysis(response: PerplexityResponse): ProductAnalysis | RecommendationResponse {
  try {
    const content = response.choices[0].message.content;
    console.log("Raw response content:", {
      length: content.length,
      preview: content.slice(0, 200),
      hasJsonStart: content.includes('{'),
      hasJsonEnd: content.includes('}')
    });

    let jsonData: any;
    let jsonString: string | null = null;

    // First try: Direct parse of the entire content
    try {
      jsonData = JSON.parse(content);
      console.log("Successfully parsed entire content as JSON");
    } catch (e) {
      console.log("Direct parse failed, attempting to extract JSON");
      
      // Second try: Extract JSON from text
      jsonString = extractJsonFromText(content);
      if (!jsonString) {
        console.error("No valid JSON structure found in response:", {
          contentLength: content.length,
          contentPreview: content.slice(0, 100),
          contentType: typeof content
        });
        throw new Error("Failed to extract valid JSON from AI response");
      }

      try {
        jsonData = JSON.parse(jsonString);
        console.log("Successfully parsed extracted JSON");
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e);
        throw new Error("Invalid JSON structure in AI response");
      }
    }

    // Clean and process the parsed data
    const cleanedData = cleanObjectStrings(jsonData);
    
    if (cleanedData.queryType?.startsWith('recommendation')) {
      return processRecommendationResponse(cleanedData);
    }
    return processAnalysisJson(cleanedData);
  } catch (error) {
    console.error("Error in parseAnalysis:", error);
    throw error;
  }
}

function processRecommendationResponse(data: any): RecommendationResponse {
  if (!Array.isArray(data.recommendations)) {
    throw new Error("Invalid recommendation response: recommendations must be an array");
  }

  return {
    queryType: data.queryType,
    originalQueryDetails: data.originalQueryDetails,
    recommendations: data.recommendations.map(rec => ({
      productName: String(rec.productName || ''),
      category: String(rec.category || ''),
      keyFeatures: Array.isArray(rec.keyFeatures) 
        ? rec.keyFeatures.map(String) 
        : String(rec.keyFeatures || '').split('；'),
      approxPriceNTD: String(rec.approxPriceNTD || ''),
      reasonWhySuitable: String(rec.reasonWhySuitable || ''),
      keyConsideration: String(rec.keyConsideration || '')
    }))
  };
}

function processAnalysisJson(jsonData: any): ProductAnalysis {
  jsonData = cleanObjectStrings(jsonData);

  const comparables: ComparableProduct[] = [];
  if (jsonData.comparableProducts && Array.isArray(jsonData.comparableProducts)) {
    jsonData.comparableProducts.forEach((item: any) => {
      if (item && typeof item.name === 'string' && typeof item.keyDifferenceOrBenefit === 'string') {
        comparables.push({
          name: String(item.name),
          keyDifferenceOrBenefit: String(item.keyDifferenceOrBenefit),
          approxPriceRange: item.approxPriceRange ? String(item.approxPriceRange) : "N/A",
        });
      } else {
        console.warn("Skipping invalid comparable product item:", item);
      }
    });
  } else {
    console.log("No comparableProducts array found or it's not an array.");
  }

  const analysis: ProductAnalysis = {
    name: String(jsonData.name || "Unknown Product"),
    category: String(jsonData.category || "General"),
    queryType: "analysis",
    priceRange: jsonData.priceRange ? String(jsonData.priceRange) : undefined,
    overview: String(jsonData.overview || "No overview available."),
    pros: Array.isArray(jsonData.pros) ? jsonData.pros.map(String) : [],
    cons: Array.isArray(jsonData.cons) ? jsonData.cons.map(String) : [],
    marketSentiment: {
      score: Number(jsonData.marketSentiment?.score) || 0,
      description: String(jsonData.marketSentiment?.description || "No sentiment description available."),
    },
    bestFor: Array.isArray(jsonData.bestFor) ? jsonData.bestFor.map(String) : [],
    considerations: Array.isArray(jsonData.considerations) ? jsonData.considerations.map(String) : [],
    tags: Array.isArray(jsonData.tags) ? jsonData.tags.filter((tag: any): tag is string => typeof tag === 'string' && ["price", "features", "reviews"].includes(tag)) : [],
    comparableProducts: comparables,
  };

  return analysis;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error("Perplexity API key not configured");
    }

    const { query, filter, language, type } = await req.json();
    console.log("Received request:", { 
      query: typeof query === 'string' ? query : 'Invalid query',
      filter: filter || 'none',
      language: language || 'default',
      type: type || 'analysis',
      queryLength: typeof query === 'string' ? query.length : 0
    });
    
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request",
          details: "Query parameter must be a non-empty string" 
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const normalizedLanguage = normalizeLanguage(language);
    const perplexityResponse = await queryPerplexity(
      query, 
      filter, 
      normalizedLanguage,
      type === 'recommendation_v2' ? 'recommendation' : 'analysis'
    );
    const analysis = parseAnalysis(perplexityResponse);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in analyze-product function:", error);
    
    const errorResponse = {
      error: "Failed to analyze product",
      details: error.message || "An unexpected error occurred",
      type: error.name,
      timestamp: new Date().toISOString()
    };

    const status = 
      error.message.includes("API key") ? 500 :
      error.message.includes("Rate limit") ? 429 :
      error.message.includes("unauthorized") ? 401 :
      error.message.includes("JSON") ? 422 : 400;

    return new Response(
      JSON.stringify(errorResponse),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});