import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const INTERVAL = 4000;
const ANIMATION_DURATION = 500;

interface Suggestion {
  text: string;
  category: string;
}

const getSuggestions = (language: string): Suggestion[] => {
  if (language === 'zh') {
    return [
      // 3C科技
      { text: 'M3 MacBook Air 值得升級嗎？', category: '3C' },
      { text: 'AirPods Pro 2 USB-C 版本推薦嗎？', category: '3C' },
      { text: 'Sony WH-1000XM5 降噪耳機評價如何？', category: '3C' },
      { text: 'iPhone 15 Pro Max 相機功能分析', category: '3C' },
      { text: 'Apple Watch Ultra 2 運動功能評測', category: '3C' },
      { text: 'ROG Ally 掌機推薦嗎？', category: '3C' },
      
      // 家電產品
      { text: 'Dyson V15 吸塵器值這個價格嗎？', category: '家電' },
      { text: '小米掃地機器人值得買嗎？', category: '家電' },
      { text: 'LG 空氣清淨機推薦嗎？', category: '家電' },
      { text: 'Panasonic 變頻冰箱省電效果分析', category: '家電' },
      { text: '東芝溫控電子鍋好用嗎？', category: '家電' },
      
      // 訂閱服務
      { text: 'Netflix 和 Disney+ 該選哪個？', category: '訂閱' },
      { text: 'Spotify Premium 家庭版划算嗎？', category: '訂閱' },
      { text: 'ChatGPT Plus 訂閱值得嗎？', category: '訂閱' },
      { text: 'YouTube Premium 推薦嗎？', category: '訂閱' },
      { text: 'Apple One 訂閱服務分析', category: '訂閱' },
      
      // 生活服務
      { text: '健身工廠和世界健身比較', category: '生活' },
      { text: 'Hahow 線上課程推薦嗎？', category: '生活' },
      { text: 'AirAsia 無限飛行通票值得買嗎？', category: '生活' },
      { text: 'foodpanda Premium 會員分析', category: '生活' },
      
      // 金融產品
      { text: '台新 Richart 數位帳戶推薦嗎？', category: '金融' },
      { text: 'Line Bank 信用卡優惠分析', category: '金融' },
      { text: '街口支付回饋值得辦嗎？', category: '金融' },
      
      // 交通工具
      { text: 'Gogoro 電動機車推薦嗎？', category: '交通' },
      { text: 'Giant 電動自行車值這個價格嗎？', category: '交通' },
      { text: 'Tesla Model 3 適合台灣嗎？', category: '交通' }
    ];
  }
  
  return [
    // Tech
    { text: 'Is the M3 MacBook Air worth upgrading?', category: 'Tech' },
    { text: 'AirPods Pro 2 USB-C review needed', category: 'Tech' },
    { text: 'How good is Sony WH-1000XM5?', category: 'Tech' },
    { text: 'iPhone 15 Pro Max camera analysis', category: 'Tech' },
    { text: 'Apple Watch Ultra 2 fitness features', category: 'Tech' },
    { text: 'Should I get the ROG Ally?', category: 'Tech' },
    
    // Home Appliances
    { text: 'Is Dyson V15 worth the price?', category: 'Home' },
    { text: 'Roomba vs Roborock comparison', category: 'Home' },
    { text: 'Best air purifier for allergies?', category: 'Home' },
    { text: 'Samsung smart fridge analysis', category: 'Home' },
    { text: 'Ninja Foodi worth buying?', category: 'Home' },
    
    // Subscriptions
    { text: 'Netflix vs Disney+ comparison', category: 'Subs' },
    { text: 'Is Spotify Family Plan worth it?', category: 'Subs' },
    { text: 'ChatGPT Plus subscription review', category: 'Subs' },
    { text: 'YouTube Premium benefits analysis', category: 'Subs' },
    { text: 'Apple One subscription worth it?', category: 'Subs' },
    
    // Services
    { text: 'Planet Fitness vs LA Fitness', category: 'Services' },
    { text: 'Masterclass subscription review', category: 'Services' },
    { text: 'Southwest Airlines annual pass', category: 'Services' },
    { text: 'DoorDash vs Uber Eats Premium', category: 'Services' },
    
    // Financial
    { text: 'Chase Sapphire card benefits', category: 'Finance' },
    { text: 'Robinhood Gold worth it?', category: 'Finance' },
    { text: 'Coinbase vs Binance comparison', category: 'Finance' },
    
    // Transportation
    { text: 'Tesla Model 3 vs Model Y', category: 'Transport' },
    { text: 'VanMoof e-bike worth the price?', category: 'Transport' },
    { text: 'Bird electric scooter review', category: 'Transport' }
  ];
};

interface SearchPlaceholderProps {
  isDisabled: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const SearchPlaceholder: React.FC<SearchPlaceholderProps> = ({ isDisabled, onFocus, onBlur }) => {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [isPaused, setIsPaused] = useState(false);
  const suggestions = getSuggestions(i18n.language);

  const nextPlaceholder = useCallback(() => {
    if (isPaused || isDisabled || suggestions.length <= 1) return;

    setDirection('up');
    const nextIndex = (currentIndex + 1) % suggestions.length;
    
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setDirection('down');
    }, ANIMATION_DURATION);
  }, [currentIndex, isPaused, isDisabled, suggestions.length]);

  useEffect(() => {
    const timer = setInterval(nextPlaceholder, INTERVAL);
    return () => clearInterval(timer);
  }, [nextPlaceholder]);

  useEffect(() => {
    setCurrentIndex(0);
    setDirection('down');
  }, [i18n.language]);

  const handleFocus = () => {
    setIsPaused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsPaused(false);
    onBlur();
  };

  const nextIndex = (currentIndex + 1) % suggestions.length;

  return {
    placeholderComponent: (
      <div className="relative w-full h-full flex items-center overflow-hidden">
        <div 
          className={`absolute w-full ${direction === 'up' ? 'transition-all duration-500 ease-in-out' : ''}`}
          style={{
            transform: direction === 'up' ? 'translateY(-100%)' : 'translateY(0)',
            opacity: direction === 'up' ? 0 : 1,
          }}
        >
          {suggestions[currentIndex].text}
        </div>
        <div 
          className={`absolute w-full ${direction === 'up' ? 'transition-all duration-500 ease-in-out' : ''}`}
          style={{
            transform: direction === 'up' ? 'translateY(0)' : 'translateY(100%)',
            opacity: direction === 'up' ? 1 : 0,
          }}
        >
          {suggestions[nextIndex].text}
        </div>
      </div>
    ),
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
};

export default SearchPlaceholder;