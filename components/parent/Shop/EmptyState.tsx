import React from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
}

export function CatalogEmptyState({
  title = "No catalog items found",
  description = "No items match your chosen filters or grade. Try selecting a different category or clearing your search.",
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4 shadow-sm my-6">
      <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
        <ShoppingBag className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 my-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div
          key={n}
          className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 animate-pulse shadow-sm"
        >
          <div className="aspect-[4/3] bg-gray-200 rounded-xl w-full" />
          <div className="h-4 bg-gray-200 rounded-md w-3/4" />
          <div className="h-3 bg-gray-100 rounded-md w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-gray-200 rounded-md w-1/3" />
            <div className="h-8 bg-gray-200 rounded-lg w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShopErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3 my-6">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
        ⚠️
      </div>
      <h3 className="text-base font-bold text-red-900">Failed to load school catalog</h3>
      <p className="text-xs text-red-700 max-w-md mx-auto">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
