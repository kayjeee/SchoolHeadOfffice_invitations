import React from 'react';
import { useCart } from './CartContext';
import { formatCurrency } from '../../../lib/api/shop-api';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function FloatingCartBar() {
  const { totalItemsCount, estimatedTotalCents, setIsCartDrawerOpen } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-4 sm:left-auto sm:right-6 sm:w-auto z-40 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="w-full sm:w-auto bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-gray-900 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900 shadow">
              {totalItemsCount}
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-400">View Request</div>
            <div className="text-sm font-extrabold text-white">
              {formatCurrency(estimatedTotalCents)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 pr-1">
          <span>Review</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
