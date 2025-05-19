import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Eye, RotateCw, Tag, Star, DollarSign } from 'lucide-react';
import { AnalysisHistory as HistoryType } from '../types/types';
import AnalysisResult from './AnalysisResult';
import RecommendationResult from './RecommendationResult';

interface AnalysisHistoryProps {
  history: HistoryType[];
  onClose: () => void;
  onAnalyze: (query: string) => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onClose, onAnalyze }) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<HistoryType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSentimentColor = (score: number): string => {
    if (score >= 8.5) return 'bg-green-100 text-green-700';
    if (score >= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredHistory = history.filter(item =>
    item.result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.result.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] flex flex-col animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{t('history.title')}</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder={t('history.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-grow overflow-y-auto relative">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {history.length === 0 ? t('history.empty') : t('history.noResults')}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {item.result.category}
                        </span>
                        {item.filter && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                            {t(`filters.${item.filter}`)}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-lg text-gray-900">{item.result.name}</h3>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {item.result.marketSentiment && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${getSentimentColor(item.result.marketSentiment.score)}`}>
                            <Star className="h-4 w-4 mr-1" />
                            {item.result.marketSentiment.score}
                          </div>
                        )}
                        {item.result.priceRange && (
                          <div className="inline-flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {item.result.priceRange}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.result.overview}</p>
                      
                      <div className="flex items-center text-gray-500 text-sm mt-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-sm">{t('history.quickView')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onAnalyze(item.query);
                          onClose();
                        }}
                        className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        <span className="text-sm">{t('history.reanalyze')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fadeIn">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
                {selectedItem.result.queryType?.startsWith('recommendation') ? (
                  <RecommendationResult
                    recommendations={selectedItem.result.recommendations}
                    onReset={() => setSelectedItem(null)}
                    onAnalyze={(query) => {
                      onAnalyze(query);
                      onClose();
                    }}
                  />
                ) : (
                  <AnalysisResult
                    product={selectedItem.result}
                    onReset={() => setSelectedItem(null)}
                    onSearch={(query) => {
                      onAnalyze(query);
                      onClose();
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHistory;