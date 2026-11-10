import React from 'react';
import { CatalogItem } from '../../../lib/api/shop-api';
import ItemCard from './ItemCard';

interface CatalogGridProps {
  items: CatalogItem[];
  onOpenDetail: (item: CatalogItem) => void;
  onQuickAdd: (item: CatalogItem) => void;
  cartItemIds: Set<string>;
}

export default function CatalogGrid({
  items,
  onOpenDetail,
  onQuickAdd,
  cartItemIds,
}: CatalogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => {
        const isInCart = cartItemIds.has(item.id);
        return (
          <ItemCard
            key={item.id}
            item={item}
            onOpenDetail={onOpenDetail}
            onQuickAdd={onQuickAdd}
            isItemInCart={isInCart}
          />
        );
      })}
    </div>
  );
}
