import React, { useState } from 'react';
import { Order, formatCurrency, CatalogItem } from '../../../lib/api/shop-api';
import OrderStatusTracker from './OrderStatusTracker';
import { ChevronDown, ChevronUp, RotateCcw, XCircle, Loader2 } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: string) => Promise<void>;
  onReorder: (order: Order) => void;
  availableCatalogItems?: CatalogItem[];
}

export default function OrderCard({
  order,
  onCancelOrder,
  onReorder,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = order.status === 'placed';

  const handleCancelClick = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel request #${order.order_number}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsCancelling(true);
      await onCancelOrder(order.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* CARD HEADER */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-900 text-base">
              #{order.order_number}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                order.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'cancelled' || order.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : order.status === 'ready_for_collection'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Placed on {formattedDate} • For{' '}
            <span className="font-semibold text-gray-700">
              {order.learner_name || 'Learner'} ({order.learner_grade || 'No Grade'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <span className="text-lg font-black text-gray-900">
            {formatCurrency(order.total_cents)}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* TRACKER SECTION */}
      <div className="p-5 bg-gray-50/50">
        <OrderStatusTracker status={order.status} />
      </div>

      {/* EXPANDED ITEMS DETAILS */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Requested Items
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between text-xs">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item.quantity}x {item.item_name}
                    </div>
                    {item.variant_name && (
                      <div className="text-gray-500 text-[11px] font-medium">
                        Size/Variant: {item.variant_name}
                      </div>
                    )}
                    {item.print_options && (
                      <div className="text-[11px] text-blue-600 font-medium">
                        {item.print_options.copies} copies •{' '}
                        {item.print_options.is_color ? 'Colour' : 'B&W'} •{' '}
                        {item.print_options.is_double_sided ? '2-sided' : '1-sided'}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[11px] text-gray-500 italic mt-0.5">
                        Note: "{item.notes}"
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.total_price_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
              <span className="font-bold text-gray-700">Special Instructions:</span>{' '}
              {order.notes}
            </div>
          )}
        </div>
      )}

      {/* CARD ACTION BUTTONS */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <div>
          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancelClick}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Cancel Request</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onReorder(order)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Order Again</span>
        </button>
      </div>
    </div>
  );
}
