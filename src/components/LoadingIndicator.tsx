import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingIndicator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 text-center">{t('loading.analyzing')}</p>
      <p className="text-sm text-gray-500 mt-2">{t('loading.collecting')}</p>
    </div>
  );
};

export default LoadingIndicator;