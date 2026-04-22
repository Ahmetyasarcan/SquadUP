import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Category, SortField, SortOrder } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants/translations';
import Input from './ui/Input';
import Button from './ui/Button';

interface ActivityFiltersProps {
  search: string;
  category: Category | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: Category | 'all') => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const CATEGORIES_LIST: (Category | 'all')[] = ['all', 'sports', 'esports', 'board_games', 'outdoor'];

export default function ActivityFilters({
  search,
  category,
  sortField,
  sortOrder,
  totalCount,
  filteredCount,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: ActivityFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6 space-y-4">
      {/* Search */}
      <Input
        type="search"
        placeholder="Aktivite, konum veya açıklama ara..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES_LIST.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none
              ${category === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            {CATEGORY_ICONS[cat]} {CATEGORIES[cat]}
          </button>
        ))}
      </div>

      {/* Sort + result count */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span>
          {filteredCount !== totalCount && (
            <> / {totalCount}</>
          )}
          {' '}aktivite
        </p>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5
              bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="datetime">Tarihe göre</option>
            <option value="title">İsme göre</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
          </Button>
        </div>
      </div>
    </div>
  );
}
