import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Calendar } from 'lucide-react';
import { AnalysisHistory as HistoryType } from '../types/types';

interface AnalysisHistoryProps {
  history: HistoryType[];
  onClose: () => void;
  onAnalyze: (query: string) => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onClose, onAnalyze }) => {
  const { t } = useTranslation();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{t('history.title')}</h2>

        <div className="flex-grow overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t('history.empty')}
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{item.result.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.result.overview}</p>
                      <div className="flex items-center text-gray-500 text-sm mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onAnalyze(item.query);
                        onClose();
                      }}
                      className="ml-4 flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      <span className="text-sm">{t('history.analyze')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHistory;