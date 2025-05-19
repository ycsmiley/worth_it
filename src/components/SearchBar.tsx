import React, { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, HelpCircle, X } from 'lucide-react';
import FilterTags from './FilterTags';
import SearchPlaceholder from './SearchPlaceholder';
import { FilterTag } from '../types/types';

interface SearchBarProps {
  onSearch: (query: string, filter: FilterTag, isRecommendation: boolean) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  isAuthenticated: boolean;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  isAuthenticated, 
  onAuthRequired,
  initialQuery = '' 
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [targetUser, setTargetUser] = useState('');
  const [specificNeeds, setSpecificNeeds] = useState('');
  const [isRecommendationMode, setIsRecommendationMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterTag>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (!isAuthenticated) {
        onAuthRequired();
        return;
      }
      
      // 構建更自然的查詢語句
      const parts = [];
      parts.push(query.trim());
      
      if (targetUser.trim()) {
        parts.push(`適合${targetUser.trim()}使用的`);
      }
      
      if (specificNeeds.trim()) {
        parts.push(`需要${specificNeeds.trim()}`);
      }
      
      const fullQuery = parts.join('，');
      
      onSearch(fullQuery, selectedFilter, isRecommendationMode);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setTargetUser('');
    setSpecificNeeds('');
    setSelectedFilter(null);
  };

  const handleFilterChange = (filter: FilterTag) => {
    setSelectedFilter(filter);
  };

  const placeholder = SearchPlaceholder({
    isDisabled: isLoading,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">{t('appName')}</h1>
      <p className="text-gray-600 text-center mb-4">
        {isAuthenticated ? t('appDescription') : t('auth.requiredMessage')}
      </p>
      
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsRecommendationMode(false)}
          className={`px-4 py-2 rounded-l-lg flex items-center ${
            !isRecommendationMode
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="h-4 w-4 mr-2" />
          {t('modes.analysis')}
        </button>
        <button
          onClick={() => setIsRecommendationMode(true)}
          className={`px-4 py-2 rounded-r-lg flex items-center ${
            isRecommendationMode
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t('modes.recommendation')}
        </button>
      </div>
      
      {isRecommendationMode && (
        <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
          <HelpCircle className="h-4 w-4 mr-1" />
          <p className="text-center">{t('recommendation.hint')}</p>
        </div>
      )}
      
      {isRecommendationMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('recommendation.targetUser')}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('recommendation.targetUserPlaceholder')}
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('recommendation.specificNeeds')}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('recommendation.specificNeedsPlaceholder')}
              value={specificNeeds}
              onChange={(e) => setSpecificNeeds(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            onFocus={placeholder.onFocus}
            onBlur={placeholder.onBlur}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-24 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          {!query && (
            <div className="absolute inset-0 flex items-center px-10 pointer-events-none text-gray-500 overflow-hidden">
              {placeholder.placeholderComponent}
            </div>
          )}
          <button
            type="submit"
            className={`absolute right-2 px-4 py-1 rounded-md ${
              isRecommendationMode 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white ${
              isLoading || !query.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
            } transition-colors`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? t('loading.analyzing') : isRecommendationMode ? t('search.recommend') : t('search.analyze')}
          </button>
        </div>
      </form>
      
      <FilterTags selectedFilter={selectedFilter} onFilterChange={handleFilterChange} isDisabled={isLoading} />
    </div>
  );
};

export default SearchBar;