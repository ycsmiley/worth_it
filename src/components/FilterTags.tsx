import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, DollarSign, Star, Sparkles } from 'lucide-react';
import { FilterTag } from '../types/types';

interface FilterTagsProps {
  selectedFilter: FilterTag;
  onFilterChange: (filter: FilterTag) => void;
  isDisabled: boolean;
  activeFilters?: FilterTag[];
}

const FilterTags: React.FC<FilterTagsProps> = ({ 
  selectedFilter, 
  onFilterChange, 
  isDisabled,
  activeFilters = ['price', 'features', 'reviews']
}) => {
  const { t } = useTranslation();

  const filters: { id: FilterTag; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'price', 
      label: t('filters.price'), 
      icon: <DollarSign className="h-4 w-4 mr-1" />,
    },
    { 
      id: 'features', 
      label: t('filters.features'), 
      icon: <Sparkles className="h-4 w-4 mr-1" />,
    },
    { 
      id: 'reviews', 
      label: t('filters.reviews'), 
      icon: <Star className="h-4 w-4 mr-1" />,
    }
  ];

  const handleTagClick = (filter: FilterTag) => {
    if (!isDisabled) {
      if (selectedFilter === filter) {
        onFilterChange(null);
      } else {
        onFilterChange(filter);
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {filters
          .filter(filter => activeFilters.includes(filter.id))
          .map(filter => (
            <button
              key={filter.id}
              onClick={() => handleTagClick(filter.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedFilter === filter.id
                  ? 'bg-blue-100 text-blue-700 border-blue-300 border shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent border'
              } ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-sm'
              }`}
              disabled={isDisabled}
            >
              {filter.icon}
              <span className="ml-1">{filter.label}</span>
            </button>
          ))}
      </div>
      {selectedFilter && (
        <p className="text-xs text-gray-500 mt-2 ml-1">
          {t(`filterHints.${selectedFilter}`)}
        </p>
      )}
    </div>
  );
};

export default FilterTags;