import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from './components/SearchBar';
import LoadingIndicator from './components/LoadingIndicator';
import AnalysisResult from './components/AnalysisResult';
import RecommendationResult from './components/RecommendationResult';
import LanguageSwitcher from './components/LanguageSwitcher';
import AuthModal from './components/Auth/AuthModal';
import UserMenu from './components/UserMenu';
import AnalysisHistory from './components/AnalysisHistory';
import { Product, FilterTag, RecommendationResponse, Session, AnalysisHistory as HistoryType } from './types/types';
import { searchProducts } from './data/mockProducts';
import { supabase } from './lib/supabase';

function App() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTag>(null);
  const [searchResult, setSearchResult] = useState<Product | null>(null);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<HistoryType[]>([]);

  // Handle initial session and auth state changes
  useEffect(() => {
    // Check for auth callback
    const handleAuthCallback = async () => {
      if (window.location.hash || window.location.search.includes('code=')) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session) {
          setSession(session);
          // Remove hash from URL
          const cleanUrl = window.location.href.split('#')[0].split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    };

    handleAuthCallback();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAnalysisHistory = useCallback(async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchAnalysisHistory();
    }
  }, [session?.user, fetchAnalysisHistory]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const handleSearch = async (query: string, filter: FilterTag = null, isRecommendation = false) => {
    setSearchQuery(query);
    setActiveFilter(filter);
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setSearchResult(null);
    setRecommendationResult(null);

    try {
      console.log('Calling Edge Function...');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query, 
          filter,
          language: i18n.language.split('-')[0], // Ensure we only send the base language code
          type: isRecommendation ? 'recommendation_v2' : 'analysis'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      if (result.queryType?.startsWith('recommendation')) {
        setRecommendationResult(result);
        if (session?.user) {
          await supabase.from('analysis_history').insert({
            user_id: session.user.id,
            query,
            filter,
            result
          });
          fetchAnalysisHistory();
        }
      } else {
        setSearchResult(result);
        if (session?.user) {
          await supabase.from('analysis_history').insert({
            user_id: session.user.id,
            query,
            filter,
            result
          });
          fetchAnalysisHistory();
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      let errorMessage = t('error.analysis');
      let details = null;
      
      if (error.message.includes('API key')) {
        errorMessage = t('error.apiKey');
        details = t('error.contactSupport');
      } else if (error.message.includes('Rate limit')) {
        errorMessage = t('error.rateLimit');
        details = t('error.tryAgainLater');
      } else if (error.message.includes('unauthorized')) {
        errorMessage = t('error.unauthorized');
        details = t('error.checkCredentials');
      }
      
      setError(errorMessage);
      setErrorDetails(details);
      setRecommendationResult(null);
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResult(null);
    setRecommendationResult(null);
    setSearchQuery('');
    setActiveFilter(null);
    setError(null);
  };

  const handleExampleClick = (query: string) => {
    resetSearch();
    setSearchQuery(query);
  };

  const handleComparableClick = (query: string) => {
    resetSearch();
    setSearchQuery(query);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={resetSearch}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 flex items-center justify-center mr-2 shadow-sm">
                <span className="text-yellow-800 font-bold text-lg">☺</span>
              </div>
              <h1 className="text-xl font-bold">{t('appName')}</h1>
            </button>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {session?.user ? (
                <UserMenu
                  email={session.user.email}
                  onSignOut={() => setSession(null)}
                  onShowHistory={() => setIsHistoryModalOpen(true)}
                />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('auth.signIn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto mt-4">
          {!searchResult && !recommendationResult && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <SearchBar 
                onSearch={handleSearch} 
                isLoading={isLoading}
                initialQuery={searchQuery}
              />
              
              {isLoading && <LoadingIndicator />}
              
              {error && (
                <div className="text-center text-red-600 mt-4">
                  <p>{error}</p>
                  {errorDetails && (
                    <p className="text-sm mt-2 text-gray-600">{errorDetails}</p>
                  )}
                </div>
              )}
              
              {!isLoading && !error && (
                <div className="mt-8 text-center text-gray-600">
                  <p className="mb-4">{t('searchPrompt.message')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-md mx-auto text-xs text-gray-500">
                    {[
                      'iPhone 15',
                      'AirPods Pro 2',
                      'Sony WH-1000XM5',
                      'Nintendo Switch OLED',
                      'iPad Air',
                      'MacBook Air'
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => handleExampleClick(example)}
                        className="bg-gray-100 rounded-md p-2 hover:bg-gray-200 transition-colors text-left"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {searchResult && !recommendationResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <AnalysisResult 
                product={searchResult} 
                onReset={resetSearch}
                onSearch={handleComparableClick}
              />
            </div>
          )}
          
          {recommendationResult && !searchResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <RecommendationResult
                recommendations={recommendationResult.recommendations}
                onReset={resetSearch}
                onAnalyze={(productName) => {
                  resetSearch();
                  handleSearch(productName, null, false);
                }}
              />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      {isHistoryModalOpen && (
        <AnalysisHistory
          history={analysisHistory}
          onClose={() => setIsHistoryModalOpen(false)}
          onAnalyze={(query) => handleSearch(query, null, false)}
        />
      )}
    </div>
  );
}

export default App;