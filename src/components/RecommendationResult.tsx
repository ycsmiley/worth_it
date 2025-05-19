import React from 'react';
import { useTranslation } from 'react-i18next';
import { Recommendation } from '../types/types';
import { Search, DollarSign, Tag, ThumbsUp, AlertCircle, ArrowLeft } from 'lucide-react';

interface RecommendationResultProps {
  recommendations: Recommendation[];
  onReset: () => void;
  onAnalyze: (productName: string) => void;
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({
  recommendations,
  onReset,
  onAnalyze
}) => {
  const { t } = useTranslation();

  // Helper function to ensure keyFeatures is always an array
  const normalizeKeyFeatures = (features: string | string[]): string[] => {
    if (Array.isArray(features)) {
      return features;
    }
    return [features];
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('recommendation.title')}</h2>
        <button
          onClick={onReset}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('analysis.backToSearch')}
        </button>
      </div>

      <div className="space-y-6">
        {recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 animate-fadeIn border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-purple-900">
                    {rec.productName}
                  </h3>
                  <div className="flex items-center mt-2">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-700 font-medium text-sm">
                      {rec.approxPriceNTD}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onAnalyze(rec.productName)}
                  className="ml-4 flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>{t('analysis.analyze')}</span>
                </button>
              </div>
              
              {rec.reasonWhySuitable && (
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <ThumbsUp className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-gray-700">{rec.reasonWhySuitable}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-start bg-purple-50 rounded-lg p-4">
                  <Tag className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-2">{t('recommendation.features')}</h4>
                    <div className="text-gray-700">
                      {rec.keyFeatures && normalizeKeyFeatures(rec.keyFeatures).map((feature, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {feature.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                
                {rec.keyConsideration && (
                  <div className="mt-4 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-amber-900">{t('recommendation.keyConsiderationPrefix')}</span>
                        <span className="text-gray-700 ml-1">{rec.keyConsideration}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default RecommendationResult;