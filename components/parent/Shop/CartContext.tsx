import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { CatalogItem, ItemVariant, SelectedPrintOptions } from '../../../lib/api/shop-api';
import { Learner } from '../../../lib/api/parent-api';

export interface CartLineItem {
  cartItemId: string; // generated unique id: `${catalogItem.id}-${variant?.id || 'none'}-${printHash}`
  catalogItem: CatalogItem;
  variant?: ItemVariant | null;
  printOptions?: SelectedPrintOptions | null;
  quantity: number;
  notes?: string;
  estimatedUnitPriceCents: number;
  estimatedLineTotalCents: number;
}

export interface CartContextValue {
  selectedLearner: Learner | null;
  setSelectedLearnerWithConfirm: (learner: Learner) => boolean;
  forceSetLearner: (learner: Learner) => void;
  cartItems: CartLineItem[];
  totalItemsCount: number;
  estimatedTotalCents: number;
  addItem: (params: {
    catalogItem: CatalogItem;
    variant?: ItemVariant | null;
    printOptions?: SelectedPrintOptions | null;
    quantity: number;
    notes?: string;
  }) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastAddedItemName: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

function computeLineUnitPrice(
  item: CatalogItem,
  variant?: ItemVariant | null,
  printOptions?: SelectedPrintOptions | null
): number {
  let price = item.base_price_cents;
  if (variant && typeof variant.price_cents === 'number') {
    price = variant.price_cents;
  }

  // Handle print options price calculations if applicable
  if (item.category === 'prints' && item.print_options_config && printOptions) {
    const config = item.print_options_config;
    let pagePrice = config.price_per_page_cents ?? price;
    if (printOptions.is_color && config.color_surcharge_cents) {
      pagePrice += config.color_surcharge_cents;
    }
    if (printOptions.is_double_sided && config.double_sided_discount_cents) {
      pagePrice = Math.max(0, pagePrice - config.double_sided_discount_cents);
    }
    // Unit price is per copy
    price = pagePrice * (printOptions.copies || 1);
  }

  return price;
}

function generateCartItemId(
  itemId: string,
  variantId?: string | null,
  printOptions?: SelectedPrintOptions | null
): string {
  const parts = [itemId, variantId || 'novar'];
  if (printOptions) {
    parts.push(`c${printOptions.copies || 1}`);
    parts.push(`clr${printOptions.is_color ? '1' : '0'}`);
    parts.push(`ds${printOptions.is_double_sided ? '1' : '0'}`);
  }
  return parts.join('_');
}

export function CartProvider({
  schoolId,
  parentId,
  learners,
  children,
}: {
  schoolId: string;
  parentId: string;
  learners: Learner[];
  children: React.ReactNode;
}) {
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(() => {
    return learners.length > 0 ? learners[0] : null;
  });

  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastAddedItemName, setLastAddedItemName] = useState<string | null>(null);

  const storageKey = useMemo(() => {
    return `sho_cart_${schoolId || 'global'}_${parentId || 'guest'}`;
  }, [schoolId, parentId]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          setCartItems(parsed.items);
        }
        if (parsed && parsed.learnerId) {
          const match = learners.find((l) => l.id === parsed.learnerId);
          if (match) {
            setSelectedLearner(match);
          }
        }
      }
    } catch (e) {
      console.warn('[CartProvider] Failed to load cart from localStorage:', e);
    }
  }, [storageKey, learners]);

  // Persist to localStorage whenever cartItems or selectedLearner changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        learnerId: selectedLearner?.id || null,
        items: cartItems,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('[CartProvider] Failed to persist cart to localStorage:', e);
    }
  }, [storageKey, cartItems, selectedLearner]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.warn('[CartProvider] Failed to clear localStorage cart:', e);
    }
  }, [storageKey]);

  const setSelectedLearnerWithConfirm = useCallback(
    (newLearner: Learner): boolean => {
      if (selectedLearner?.id === newLearner.id) return true;

      if (cartItems.length > 0) {
        const confirmed = window.confirm(
          `Your cart contains items requested for ${selectedLearner?.full_name || 'the current learner'}. Switching learners will clear your current cart. Do you want to proceed?`
        );
        if (!confirmed) {
          return false;
        }
        clearCart();
      }

      setSelectedLearner(newLearner);
      return true;
    },
    [selectedLearner, cartItems.length, clearCart]
  );

  const forceSetLearner = useCallback((newLearner: Learner) => {
    setSelectedLearner(newLearner);
  }, []);

  const addItem = useCallback(
    (params: {
      catalogItem: CatalogItem;
      variant?: ItemVariant | null;
      printOptions?: SelectedPrintOptions | null;
      quantity: number;
      notes?: string;
    }) => {
      const { catalogItem, variant, printOptions, quantity, notes } = params;
      const cartItemId = generateCartItemId(catalogItem.id, variant?.id, printOptions);
      const unitPrice = computeLineUnitPrice(catalogItem, variant, printOptions);

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.cartItemId === cartItemId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const existing = updated[existingIdx];
          const newQty = existing.quantity + quantity;
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            notes: notes !== undefined ? notes : existing.notes,
            estimatedUnitPriceCents: unitPrice,
            estimatedLineTotalCents: unitPrice * newQty,
          };
          return updated;
        }

        const newLine: CartLineItem = {
          cartItemId,
          catalogItem,
          variant: variant || null,
          printOptions: printOptions || null,
          quantity,
          notes: notes || '',
          estimatedUnitPriceCents: unitPrice,
          estimatedLineTotalCents: unitPrice * quantity,
        };
        return [...prev, newLine];
      });

      setLastAddedItemName(catalogItem.name);
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    setCartItems((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((item) => item.cartItemId !== cartItemId);
      }
      return prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            estimatedLineTotalCents: item.estimatedUnitPriceCents * newQuantity,
          };
        }
        return item;
      });
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const updateNotes = useCallback((cartItemId: string, notes: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, notes } : item))
    );
  }, []);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const estimatedTotalCents = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.estimatedLineTotalCents, 0);
  }, [cartItems]);

  const value: CartContextValue = {
    selectedLearner,
    setSelectedLearnerWithConfirm,
    forceSetLearner,
    cartItems,
    totalItemsCount,
    estimatedTotalCents,
    addItem,
    updateQuantity,
    removeItem,
    updateNotes,
    clearCart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    lastAddedItemName,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
