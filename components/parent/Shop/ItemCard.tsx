import React from 'react';
import { CatalogItem, formatCurrency } from '../../../lib/api/shop-api';
import { Plus, Check, AlertCircle } from 'lucide-react';

interface ItemCardProps {
  item: CatalogItem;
  onOpenDetail: (item: CatalogItem) => void;
  onQuickAdd?: (item: CatalogItem) => void;
  isItemInCart?: boolean;
}

export default function ItemCard({
  item,
  onOpenDetail,
  onQuickAdd,
  isItemInCart,
}: ItemCardProps) {
  const isOutOfStock = item.is_in_stock === false || item.stock_quantity === 0;
  const isLowStock =
    !isOutOfStock &&
    typeof item.stock_quantity === 'number' &&
    item.stock_quantity > 0 &&
    item.stock_quantity <= 5;

  const requiresOptions =
    item.category === 'prints' ||
    item.has_variants ||
    (item.variants && item.variants.length > 0);

  const handleCardClick = () => {
    onOpenDetail(item);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requiresOptions) {
      onOpenDetail(item);
    } else if (onQuickAdd) {
      onQuickAdd(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
        isOutOfStock ? 'opacity-60 pointer-events-none' : ''
      }`}
    >
      <div>
        {/* ITEM IMAGE OR CATEGORY PLACEHOLDER */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
              <span className="text-4xl mb-1">
                {item.category === 'prints'
                  ? '📄'
                  : item.category === 'uniform'
                  ? '👕'
                  : item.category === 'stationery'
                  ? '✏️'
                  : '📦'}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                {item.category}
              </span>
            </div>
          )}

          {/* STOCK BADGE */}
          {isOutOfStock ? (
            <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Out of stock</span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span>Only {item.stock_quantity} left</span>
            </div>
          ) : null}

          {/* CATEGORY TAG */}
          {item.subcategory && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {item.subcategory}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[32px]">
            {item.description || 'High-quality school supplies approved for learners.'}
          </p>
        </div>
      </div>

      {/* FOOTER & PRICE */}
      <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2">
        <div>
          <div className="text-[11px] text-gray-400 font-medium">
            {requiresOptions ? 'From' : 'Price'}
          </div>
          <div className="text-base font-extrabold text-gray-900">
            {formatCurrency(item.base_price_cents)}
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddClick}
          aria-label={`Add ${item.name} to request`}
          className={`h-9 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
            isItemInCart
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {isItemInCart ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{requiresOptions ? 'Options' : 'Add'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
