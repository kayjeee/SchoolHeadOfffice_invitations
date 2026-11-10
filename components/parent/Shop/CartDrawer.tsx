import React from 'react';
import { useCart } from './CartContext';
import { formatCurrency } from '../../../lib/api/shop-api';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const {
    cartItems,
    totalItemsCount,
    estimatedTotalCents,
    updateQuantity,
    removeItem,
    clearCart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    setIsCheckoutOpen,
    selectedLearner,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* BACKDROP */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
        >
          {/* HEADER */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Request Cart</h2>
                <div className="text-xs text-gray-500">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} • For{' '}
                  <span className="font-semibold text-gray-800">
                    {selectedLearner?.full_name || selectedLearner?.first_name || 'Learner'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center text-2xl mb-3">
                  🛍️
                </div>
                <h3 className="font-bold text-gray-900 text-base">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Browse the school catalog and add uniform items, past exam papers, or stationery supplies.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.catalogItem.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-500">
                        {item.variant && (
                          <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md font-medium text-gray-700">
                            {item.variant.name}
                          </span>
                        )}
                        {item.printOptions && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                            {item.printOptions.copies} copy
                            {item.printOptions.copies > 1 ? 's' : ''} •{' '}
                            {item.printOptions.is_color ? 'Colour' : 'B&W'} •{' '}
                            {item.printOptions.is_double_sided ? '2-sided' : '1-sided'}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-gray-500 italic mt-1.5 bg-white p-2 rounded-lg border border-gray-100">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      aria-label="Remove item"
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <div className="text-xs font-bold text-gray-900">
                      {formatCurrency(item.estimatedLineTotalCents)}
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden h-8">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated Total:</span>
                <span className="text-xl font-extrabold text-gray-900">
                  {formatCurrency(estimatedTotalCents)}
                </span>
              </div>

              <div className="text-[11px] text-gray-500 bg-blue-50/70 border border-blue-100 p-3 rounded-xl">
                ℹ️ <strong>Request only:</strong> Payment is processed directly at the school office upon collection.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-4 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-white transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Review Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
