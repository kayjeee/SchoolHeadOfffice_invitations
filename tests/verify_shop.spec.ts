import { test, expect } from '@playwright/test';
import {
  CatalogItemSchema,
  OrderSchema,
  formatCurrency,
} from '../lib/api/shop-api';

test.describe('Shop API Zod Schemas & Currency Formatting', () => {
  test('formatCurrency correctly formats integer cents to ZAR', () => {
    expect(formatCurrency(0)).toBe('R 0.00');
    expect(formatCurrency(4500)).toBe('R 45.00');
    expect(formatCurrency(12999)).toBe('R 129.99');
    expect(formatCurrency(null)).toBe('R 0.00');
    expect(formatCurrency(undefined)).toBe('R 0.00');
  });

  test('CatalogItemSchema accepts null for optional fields without throwing', () => {
    const rawBackendItem = {
      id: 'item-1',
      school_id: null,
      name: 'Mathematics Past Paper 2023',
      description: null,
      category: 'prints',
      subcategory: null,
      base_price_cents: 2500,
      image_url: null,
      stock_quantity: null,
      is_in_stock: true,
      applicable_grades: null,
      has_variants: null,
      variants: null,
      print_options_config: {
        allow_color: true,
        allow_double_sided: null,
        max_copies: 10,
        price_per_page_cents: 50,
        color_surcharge_cents: null,
        double_sided_discount_cents: null,
      },
      created_at: null,
      updated_at: null,
    };

    const parsed = CatalogItemSchema.parse(rawBackendItem);
    expect(parsed.id).toBe('item-1');
    expect(parsed.name).toBe('Mathematics Past Paper 2023');
    expect(parsed.description).toBeNull();
    expect(parsed.base_price_cents).toBe(2500);
    expect(parsed.variants).toBeNull();
  });

  test('OrderSchema accepts null for optional fields and parses valid status', () => {
    const rawBackendOrder = {
      id: 'order-123',
      order_number: 'ORD-9876',
      school_id: 'school-1',
      school_name: null,
      parent_id: null,
      parent_name: null,
      parent_email: 'parent@example.com',
      learner_id: 'learner-1',
      learner_name: 'John Doe',
      learner_grade: 'Grade 10',
      status: 'placed',
      status_display: 'Placed',
      total_cents: 7500,
      subtotal_cents: null,
      notes: null,
      fulfilment_type: 'collect_at_school',
      items: [
        {
          id: null,
          catalog_item_id: 'item-1',
          item_name: 'School Blazer',
          variant_id: 'size-m',
          variant_name: 'Size Medium',
          quantity: 1,
          unit_price_cents: 7500,
          total_price_cents: 7500,
          print_options: null,
          notes: null,
        },
      ],
      created_at: '2026-11-10T12:00:00Z',
      updated_at: null,
      cancellation_reason: null,
    };

    const parsed = OrderSchema.parse(rawBackendOrder);
    expect(parsed.id).toBe('order-123');
    expect(parsed.order_number).toBe('ORD-9876');
    expect(parsed.status).toBe('placed');
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].variant_name).toBe('Size Medium');
  });

  test('OrderStatus validation only permits defined lifecycle states', () => {
    const validStatuses = [
      'placed',
      'accepted',
      'preparing',
      'ready_for_collection',
      'completed',
      'cancelled',
      'rejected',
    ];

    for (const st of validStatuses) {
      const order = {
        id: 'ord-1',
        order_number: 'ORD-01',
        school_id: 'sch-1',
        learner_id: 'lrn-1',
        status: st,
        total_cents: 1000,
        items: [],
        created_at: '2026-11-10',
      };
      expect(() => OrderSchema.parse(order)).not.toThrow();
    }

    const invalidOrder = {
      id: 'ord-1',
      order_number: 'ORD-01',
      school_id: 'sch-1',
      learner_id: 'lrn-1',
      status: 'shipped_to_home',
      total_cents: 1000,
      items: [],
      created_at: '2026-11-10',
    };
    expect(() => OrderSchema.parse(invalidOrder)).toThrow();
  });
});
