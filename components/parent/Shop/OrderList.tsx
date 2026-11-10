import React from 'react';
import { Order, CatalogItem } from '../../../lib/api/shop-api';
import OrderCard from './OrderCard';
import { RefreshCw, PackageOpen } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
  onCancelOrder: (orderId: string) => Promise<void>;
  onReorder: (order: Order) => void;
  availableCatalogItems?: CatalogItem[];
}

export default function OrderList({
  orders,
  isLoading,
  onRefresh,
  onCancelOrder,
  onReorder,
  availableCatalogItems,
}: OrderListProps) {
  return (
    <div className="space-y-4">
      {/* HEADER & REFRESH ACTION */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Request History</h3>
          <p className="text-xs text-gray-500">
            Track status updates in real-time or reorder past stationery and uniform items.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh orders"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ORDERS LIST OR EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900">No requests placed yet</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't requested any prints, stationery, or uniforms yet. Items you request will appear here with live tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancelOrder={onCancelOrder}
              onReorder={onReorder}
              availableCatalogItems={availableCatalogItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}
