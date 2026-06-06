import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface FiltersProps {
  options: Record<string, FilterOption[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onSearchChange?: (search: string) => void;
}

export function Filters({ options, onFiltersChange, onSearchChange }: FiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterToggle = (category: string, filterId: string) => {
    setActiveFilters((prev) => {
      const categoryFilters = prev[category] || [];
      const newFilters = categoryFilters.includes(filterId)
        ? categoryFilters.filter((f) => f !== filterId)
        : [...categoryFilters, filterId];

      const updated = { ...prev, [category]: newFilters };
      onFiltersChange(updated);
      return updated;
    });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    onFiltersChange({});
    onSearchChange?.('');
  };

  const hasActiveFilters = Object.values(activeFilters).some((arr) => arr.length > 0) || searchQuery.length > 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(options).map(([category, filters]) => (
          <div key={category} className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterToggle(category, filter.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeFilters[category]?.includes(filter.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={16} />
          Clear filters
        </button>
      )}
    </div>
  );
}
