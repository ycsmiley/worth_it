import { Product } from '../types/types';

export const mockProducts: Product[] = [
  {
    id: 'iphone15',
    name: 'iPhone 15',
    category: '智慧型手機',
    overview: 'iPhone 15是蘋果公司推出的最新智慧型手機，搭載A16仿生晶片，提供優質的效能和相機體驗。',
    pros: [
      '優質的相機系統，特別是在弱光環境下',
      '強大的A16晶片提供流暢的效能',
      '耐用的設計和良好的建構品質',
      '長期軟體支援保證',
      'USB-C連接埠增加了兼容性'
    ],
    cons: [
      '相較於前代產品價格較高',
      '充電速度仍然較慢',
      '基本款存儲空間偏小',
      '無法完全客製化操作系統'
    ],
    marketSentiment: {
      score: 8.7,
      description: '市場普遍對iPhone 15的評價正面，尤其讚賞其相機品質和整體效能表現。'
    },
    bestFor: [
      '需要可靠、高效能手機的一般消費者',
      '重視拍照品質的使用者',
      '已在蘋果生態系統中的用戶',
      '願意為高品質產品支付溢價的消費者'
    ],
    considerations: [
      '如果您已擁有iPhone 14，可能升級幅度不大',
      '預算有限的消費者可能需要考慮性價比',
      '若您偏好高度客製化，Android系統可能更適合您',
      '基本款128GB可能不足以存儲大量影片和應用'
    ],
    tags: ['price', 'features', 'reviews']
  },
  {
    id: 'airpodspro2',
    name: 'AirPods Pro 2',
    category: '無線耳機',
    overview: 'AirPods Pro 2是蘋果公司的高端無線耳機，提供主動降噪、空間音訊和透明模式等功能。',
    pros: [
      '卓越的主動降噪功能',
      '舒適的配戴體驗，適合長時間使用',
      '與蘋果設備無縫整合',
      '空間音訊提供沉浸式聽覺體驗',
      '改進的電池續航力'
    ],
    cons: [
      '價格較高',
      '與非蘋果設備的相容性有限',
      '耳塞設計不適合所有人',
      '維修和電池更換成本高'
    ],
    marketSentiment: {
      score: 8.5,
      description: '市場普遍認為AirPods Pro 2雖然價格高但物有所值，尤其是對於蘋果用戶。'
    },
    bestFor: [
      '頻繁使用無線耳機的蘋果設備用戶',
      '需要優質降噪功能的通勤者或旅行者',
      '注重音質的聽眾',
      '願意為便利性和品質支付溢價的消費者'
    ],
    considerations: [
      '非蘋果設備用戶應考慮其他更相容的選擇',
      '對價格敏感的消費者可能想探索更經濟的替代品',
      '如果您偏好開放式耳機，耳塞設計可能不適合',
      '需考慮長期使用後電池老化的影響'
    ],
    tags: ['price', 'features', 'reviews']
  },
  {
    id: 'sonyxm5',
    name: 'Sony WH-1000XM5',
    category: '無線耳罩式耳機',
    overview: 'Sony WH-1000XM5是Sony推出的旗艦級無線降噪耳罩式耳機，以卓越的音質和降噪能力著稱。',
    pros: [
      '業界領先的主動降噪技術',
      '出色的聲音品質和平衡',
      '舒適的設計適合長時間配戴',
      '強大的電池續航力',
      '多設備連接能力'
    ],
    cons: [
      '不能像前代產品一樣折疊',
      '價格較高',
      '觸控控制可能需要適應',
      '某些功能需要使用專用應用程式'
    ],
    marketSentiment: {
      score: 9.2,
      description: '市場評價極高，被廣泛認為是目前最好的無線降噪耳機之一。'
    },
    bestFor: [
      '經常旅行者和通勤者',
      '音樂愛好者和專業人士',
      '需要在嘈雜環境中工作的人',
      '願意投資高品質音訊設備的消費者'
    ],
    considerations: [
      '預算有限的消費者可能需要考慮性價比',
      '如果便攜性是首要考量，其不可折疊的設計可能是缺點',
      '蘋果用戶可能想考慮更整合的選擇',
      '實體按鈕愛好者可能需要適應觸控界面'
    ],
    tags: ['features', 'reviews']
  },
  {
    id: 'switcholed',
    name: 'Nintendo Switch OLED',
    category: '遊戲主機',
    overview: 'Nintendo Switch OLED是任天堂Switch系列的高階版本，配備改進的OLED螢幕和其他硬體升級。',
    pros: [
      '更大、更明亮的OLED螢幕',
      '改進的支架設計',
      '增強的音效品質',
      '擴大的內部儲存空間',
      '有線網路連接埠'
    ],
    cons: [
      '處理器和效能與標準版相同',
      '電池續航力未明顯提升',
      '相較標準版價格更高',
      '未解決Joy-Con漂移潛在問題'
    ],
    marketSentiment: {
      score: 7.8,
      description: '市場評價正面，特別是針對新用戶，但現有Switch用戶可能認為升級價值有限。'
    },
    bestFor: [
      '首次購買Switch的玩家',
      '主要在掌機模式下玩遊戲的用戶',
      '視覺體驗優先的玩家',
      '任天堂遊戲愛好者'
    ],
    considerations: [
      '如果您已擁有Switch，升級價值可能取決於您的使用習慣',
      '期待效能提升的玩家可能會失望',
      '預算有限的玩家可考慮標準版或Lite版',
      '主要在電視模式下玩遊戲的用戶可能獲益較少'
    ],
    tags: ['price', 'reviews']
  }
];

export const searchProducts = (query: string, filter: 'price' | 'features' | 'reviews' | null): Product[] => {
  // In a real app, this would be an API call
  // For the MVP, we'll use simple filtering of our mock data
  
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase();
  
  let results = mockProducts.filter(product => 
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.category.toLowerCase().includes(normalizedQuery)
  );
  
  // Apply filter if selected
  if (filter) {
    results = results.filter(product => product.tags.includes(filter));
  }
  
  return results;
};