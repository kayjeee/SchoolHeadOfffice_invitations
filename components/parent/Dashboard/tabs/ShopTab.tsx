import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Learner, ParentProfile } from '../../../../lib/api/parent-api';
import { ShopAPI, CatalogItem, Order } from '../../../../lib/api/shop-api';
import { CartProvider, useCart } from '../../Shop/CartContext';
import LearnerSelector from '../../Shop/LearnerSelector';
import CategoryChips from '../../Shop/CategoryChips';
import CatalogGrid from '../../Shop/CatalogGrid';
import ItemDetailSheet from '../../Shop/ItemDetailSheet';
import CartDrawer from '../../Shop/CartDrawer';
import FloatingCartBar from '../../Shop/FloatingCartBar';
import CheckoutSheet from '../../Shop/CheckoutSheet';
import OrderList from '../../Shop/OrderList';
import { CatalogEmptyState, ShopSkeleton, ShopErrorState } from '../../Shop/EmptyState';
import { ShoppingBag, Clock, ShoppingCart } from 'lucide-react';

interface ShopTabProps {
  schoolId: string;
  parentProfile: ParentProfile | null;
  learners: Learner[];
}

function ShopContent({
  schoolId,
  parentProfile,
  learners,
}: ShopTabProps) {
  const queryClient = useQueryClient();
  const {
    selectedLearner,
    cartItems,
    addItem,
    totalItemsCount,
    setIsCartDrawerOpen,
    lastAddedItemName,
  } = useCart();

  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'orders'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDetailItem, setActiveDetailItem] = useState<CatalogItem | null>(null);

  // 1. Fetch Catalog Items with React Query
  const {
    data: catalogItems = [],
    isLoading: isCatalogLoading,
    isError: isCatalogError,
    error: catalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ['shop-catalog', schoolId, selectedCategory, selectedSubcategory],
    queryFn: () =>
      ShopAPI.listCatalogItems(schoolId, {
        category: selectedCategory,
        subcategory: selectedSubcategory,
      }),
    staleTime: 60 * 1000,
  });

  // 2. Fetch Orders with 30-second polling and window focus re-fetching
  const parentId = parentProfile?.id || parentProfile?.user_id || '';
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['shop-orders', schoolId, parentId],
    queryFn: () =>
      ShopAPI.listOrders({
        schoolId,
        parentId,
        email: parentProfile?.email,
      }),
    refetchInterval: 30000, // 30 seconds polling
    refetchOnWindowFocus: true,
  });

  // 3. Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => ShopAPI.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-orders', schoolId, parentId] });
    },
    onError: (err: any) => {
      alert(`Could not cancel request: ${err?.message || 'Server error'}`);
    },
  });

  const handleCancelOrder = async (orderId: string) => {
    await cancelMutation.mutateAsync(orderId);
  };

  // 4. Filter Catalog Items based on search and learner grade
  const filteredCatalogItems = useMemo(() => {
    return catalogItems.filter((item) => {
      // Grade filter: If item specifies applicable grades and learner has a grade
      if (
        item.applicable_grades &&
        item.applicable_grades.length > 0 &&
        selectedLearner?.grade
      ) {
        const matchesGrade = item.applicable_grades.some(
          (g) =>
            g.toLowerCase() === selectedLearner.grade.toLowerCase() ||
            selectedLearner.grade.toLowerCase().includes(g.toLowerCase()) ||
            g.toLowerCase().includes(selectedLearner.grade.toLowerCase())
        );
        if (!matchesGrade) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        const subcatMatch = item.subcategory?.toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !subcatMatch) return false;
      }

      return true;
    });
  }, [catalogItems, selectedLearner?.grade, searchQuery]);

  const cartItemIds = useMemo(() => {
    return new Set(cartItems.map((c) => c.catalogItem.id));
  }, [cartItems]);

  const handleQuickAdd = useCallback(
    (item: CatalogItem) => {
      addItem({
        catalogItem: item,
        quantity: 1,
      });
    },
    [addItem]
  );

  const handleReorder = useCallback(
    (order: Order) => {
      const missingItems: string[] = [];
      let addedCount = 0;

      order.items.forEach((item) => {
        // Check if catalog item is still available
        const catalogMatch = catalogItems.find((c) => c.id === item.catalog_item_id);
        if (catalogMatch && catalogMatch.is_in_stock !== false) {
          addItem({
            catalogItem: catalogMatch,
            quantity: item.quantity,
            notes: item.notes || undefined,
            printOptions: item.print_options,
          });
          addedCount += 1;
        } else {
          missingItems.push(item.item_name);
        }
      });

      if (missingItems.length > 0) {
        alert(
          `Some items from your previous request are no longer available and were skipped: ${missingItems.join(
            ', '
          )}.`
        );
      } else if (addedCount > 0) {
        setActiveSubTab('browse');
        setIsCartDrawerOpen(true);
      }
    },
    [catalogItems, addItem, setIsCartDrawerOpen]
  );

  const handleOrderSuccess = useCallback(
    (newOrder: Order) => {
      queryClient.invalidateQueries({ queryKey: ['shop-orders', schoolId, parentId] });
      setActiveSubTab('orders');
    },
    [queryClient, schoolId, parentId]
  );

  return (
    <div className="space-y-6">
      {/* TOP SUB-TAB NAVIGATION & CART BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('browse')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeSubTab === 'browse'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeSubTab === 'orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Requests</span>
            {orders.length > 0 && (
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  activeSubTab === 'orders'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* DESKTOP VIEW CART BUTTON */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label="View request cart"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow hover:bg-black transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Request</span>
            {totalItemsCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-black">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: BROWSE CATALOG */}
      {activeSubTab === 'browse' && (
        <div>
          {/* LEARNER SELECTOR */}
          <LearnerSelector learners={learners} />

          {/* SEARCH & CATEGORY CHIPS */}
          <CategoryChips
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* CATALOG DISPLAY */}
          {isCatalogLoading ? (
            <ShopSkeleton />
          ) : isCatalogError ? (
            <ShopErrorState
              message={
                (catalogError as any)?.message ||
                'Unable to retrieve school catalog items right now.'
              }
              onRetry={() => refetchCatalog()}
            />
          ) : filteredCatalogItems.length === 0 ? (
            <CatalogEmptyState
              onResetFilters={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('');
                setSearchQuery('');
              }}
            />
          ) : (
            <CatalogGrid
              items={filteredCatalogItems}
              onOpenDetail={(item) => setActiveDetailItem(item)}
              onQuickAdd={handleQuickAdd}
              cartItemIds={cartItemIds}
            />
          )}
        </div>
      )}

      {/* SUB-VIEW 2: MY REQUESTS & LIVE TRACKING */}
      {activeSubTab === 'orders' && (
        <OrderList
          orders={orders}
          isLoading={isOrdersLoading}
          onRefresh={() => refetchOrders()}
          onCancelOrder={handleCancelOrder}
          onReorder={handleReorder}
          availableCatalogItems={catalogItems}
        />
      )}

      {/* ITEM DETAIL MODAL */}
      <ItemDetailSheet
        item={activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
      />

      {/* CART DRAWER & CHECKOUT */}
      <CartDrawer />
      <CheckoutSheet
        schoolId={schoolId}
        parentProfile={parentProfile}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* FLOATING MOBILE CART BAR */}
      <FloatingCartBar />

      {/* ACCESSIBILITY LIVE ANNOUNCER */}
      <div className="sr-only" aria-live="polite">
        {lastAddedItemName ? `Added ${lastAddedItemName} to request cart` : ''}
      </div>
    </div>
  );
}

export default function ShopTab({
  schoolId,
  parentProfile,
  learners,
}: ShopTabProps) {
  const parentId = parentProfile?.id || parentProfile?.user_id || 'parent';

  return (
    <CartProvider schoolId={schoolId} parentId={parentId} learners={learners}>
      <ShopContent
        schoolId={schoolId}
        parentProfile={parentProfile}
        learners={learners}
      />
    </CartProvider>
  );
}
