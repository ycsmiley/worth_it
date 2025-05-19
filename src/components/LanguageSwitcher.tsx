import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
      aria-label="Switch language"
    >
      <Languages className="h-5 w-5 mr-1" />
      <span className="text-sm font-medium">{i18n.language === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
};

export default LanguageSwitcher;