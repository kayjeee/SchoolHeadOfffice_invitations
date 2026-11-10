import React from 'react';
import { Search, X } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🛍️' },
  { id: 'prints', label: 'Prints & Exam Papers', icon: '📄' },
  { id: 'stationery', label: 'Stationery', icon: '✏️' },
  { id: 'uniform', label: 'Uniform', icon: '👕' },
];

const SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  prints: ['Past Papers', 'Assignments', 'Study Guides', 'Worksheets'],
  stationery: ['Pens & Pencils', 'Notebooks', 'Calculators', 'Art Supplies'],
  uniform: ['Shirts', 'Trousers & Skirts', 'Blazers', 'Sportswear', 'Ties & Badges'],
};

export default function CategoryChips({
  selectedCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  searchQuery,
  onSearchChange,
}: CategoryChipsProps) {
  const currentSubcategories = SUBCATEGORIES_BY_CATEGORY[selectedCategory] || [];

  return (
    <div className="space-y-4 mb-6">
      {/* STICKY SEARCH BAR */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search catalog items by name, subject, or code..."
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* TOP-LEVEL CATEGORY CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubcategory('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBCATEGORY CHIPS (IF APPLICABLE) */}
      {currentSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => onSelectSubcategory('')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedSubcategory === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All {selectedCategory}
          </button>
          {currentSubcategories.map((sub) => {
            const isSubActive = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => onSelectSubcategory(sub)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSubActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
