import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types/types';
import { Sparkles, AlertTriangle, BarChart3, Users, Lightbulb, Scale, Search, DollarSign } from 'lucide-react';

interface AnalysisResultProps {
  product: Product;
  onReset: () => void;
  onSearch: (query: string) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ product, onReset, onSearch }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'details' | 'comparables'>('details');

  const getSentimentColor = (score: number): string => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleComparableClick = (productName: string) => {
    onSearch(productName);
  };

  const renderDetailsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-2">{t('analysis.overview')}</h3>
        <p className="text-gray-700">{product.overview}</p>
        {product.priceRange && (
          <div className="mt-4 flex items-center text-blue-600">
            <DollarSign className="h-5 w-5 mr-2" />
            <span className="font-medium">{t('analysis.priceRange')}: {product.priceRange}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg shadow-md p-6 animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center mb-3">
            <Sparkles className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">{t('analysis.pros')}</h3>
          </div>
          <ul className="space-y-2">
            {product.pros.map((pro, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-gray-700">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg shadow-md p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold">{t('analysis.cons')}</h3>
          </div>
          <ul className="space-y-2">
            {product.cons.map((con, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span className="text-gray-700">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center mb-3">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">{t('analysis.marketSentiment')}</h3>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4 aspect-square">
            <span className={`text-xl font-bold ${getSentimentColor(product.marketSentiment.score)}`}>
              {product.marketSentiment.score}
            </span>
          </div>
          <p className="text-gray-700">{product.marketSentiment.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center mb-3">
          <Users className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold">{t('analysis.bestFor')}</h3>
        </div>
        <ul className="space-y-2">
          {product.bestFor.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 rounded-lg shadow-md p-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center mb-3">
          <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
          <h3 className="text-lg font-semibold">{t('analysis.considerations')}</h3>
        </div>
        <ul className="space-y-2">
          {product.considerations.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-amber-600 mr-2">!</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderComparablesTab = () => (
    <div className="space-y-4 animate-fadeIn">
      {product.comparableProducts && product.comparableProducts.map((comparable, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-purple-900 mb-2">{comparable.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t('analysis.keyDifferences')}</h4>
                    <p className="text-gray-700">{comparable.keyDifferenceOrBenefit}</p>
                  </div>
                  {comparable.uniqueSellingPoint && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('analysis.uniqueFeatures')}</h4>
                      <p className="text-purple-700">{comparable.uniqueSellingPoint}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {comparable.targetAudience && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('analysis.bestFor')}</h4>
                      <p className="text-gray-700">{comparable.targetAudience}</p>
                    </div>
                  )}
                  {comparable.approxPriceRange && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t('analysis.priceRange')}</h4>
                      <p className="text-purple-700 font-medium">{comparable.approxPriceRange}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleComparableClick(comparable.name)}
              className="ml-4 flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors shadow-sm"
            >
              <Search className="h-4 w-4 mr-1" />
              <span className="text-sm">{t('analysis.analyze')}</span>
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-500">{t('analysis.comparison')}</h4>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-purple-900 mb-1">{product.name}</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {product.pros.slice(0, 2).map((pro, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-1">{comparable.name}</h5>
                <div className="text-sm text-gray-600">
                  {comparable.uniqueSellingPoint && (
                    <p className="flex items-start">
                      <span className="text-purple-600 mr-2">★</span>
                      <span>{comparable.uniqueSellingPoint}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
          <h2 className="text-2xl font-bold">{product.name}</h2>
        </div>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          {t('analysis.backToSearch')}
        </button>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('analysis.details')}
          </button>
          <button
            onClick={() => setActiveTab('comparables')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'comparables'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('analysis.comparableProducts')}
            {product.comparableProducts && (
              <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                {product.comparableProducts.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'details' ? renderDetailsTab() : renderComparablesTab()}
    </div>
  );
};

export default AnalysisResult;