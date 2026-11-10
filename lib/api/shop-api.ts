import { z } from 'zod';
import { apiClient } from './api-client';

// ============================================================================
// CURRENCY & FORMATTING HELPERS
// ============================================================================

/**
 * Formats integer cents into a South African Rand (ZAR) string (e.g., 4500 -> "R 45.00").
 */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return 'R 0.00';
  }
  const rands = (cents / 100).toFixed(2);
  return `R ${rands}`;
}

// ============================================================================
// ZOD SCHEMAS (NULL-SAFE WITH .nullish())
// ============================================================================

export const PrintOptionsConfigSchema = z
  .object({
    allow_color: z.boolean().nullish(),
    allow_double_sided: z.boolean().nullish(),
    max_copies: z.number().nullish(),
    price_per_page_cents: z.number().nullish(),
    color_surcharge_cents: z.number().nullish(),
    double_sided_discount_cents: z.number().nullish(),
  })
  .nullish();

export const ItemVariantSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g. "Size 32", "Medium", "Red"
  sku: z.string().nullish(),
  price_cents: z.number().nullish(), // Variant specific price override in cents
  stock_quantity: z.number().nullish(),
  is_available: z.boolean().nullish(),
});

export const CatalogItemSchema = z.object({
  id: z.string(),
  school_id: z.string().nullish(),
  name: z.string(),
  description: z.string().nullish(),
  category: z.enum(['prints', 'stationery', 'uniform', 'other']).or(z.string()),
  subcategory: z.string().nullish(), // e.g. "Past Papers", "Pencils", "Shirts"
  base_price_cents: z.number(), // Price in integer cents
  image_url: z.string().nullish(),
  stock_quantity: z.number().nullish(), // null if unlimited
  is_in_stock: z.boolean().nullish(),
  applicable_grades: z.array(z.string()).nullish(), // Grade IDs or grade names
  has_variants: z.boolean().nullish(),
  variants: z.array(ItemVariantSchema).nullish(),
  print_options_config: PrintOptionsConfigSchema,
  created_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const SelectedPrintOptionsSchema = z
  .object({
    copies: z.number().min(1).default(1),
    is_color: z.boolean().default(false),
    is_double_sided: z.boolean().default(false),
  })
  .nullish();

export const OrderItemRequestSchema = z.object({
  catalog_item_id: z.string(),
  variant_id: z.string().nullish(),
  quantity: z.number().int().min(1),
  print_options: SelectedPrintOptionsSchema,
  notes: z.string().nullish(),
});

export const OrderItemSchema = z.object({
  id: z.string().nullish(),
  catalog_item_id: z.string(),
  item_name: z.string(),
  variant_id: z.string().nullish(),
  variant_name: z.string().nullish(),
  quantity: z.number().int(),
  unit_price_cents: z.number().int(),
  total_price_cents: z.number().int(),
  print_options: SelectedPrintOptionsSchema,
  notes: z.string().nullish(),
});

export const OrderStatusSchema = z.enum([
  'placed',
  'accepted',
  'preparing',
  'ready_for_collection',
  'completed',
  'cancelled',
  'rejected',
]);

export const OrderSchema = z.object({
  id: z.string(),
  order_number: z.string(),
  school_id: z.string(),
  school_name: z.string().nullish(),
  parent_id: z.string().nullish(),
  parent_name: z.string().nullish(),
  parent_email: z.string().nullish(),
  learner_id: z.string(),
  learner_name: z.string().nullish(),
  learner_grade: z.string().nullish(),
  status: OrderStatusSchema,
  status_display: z.string().nullish(),
  total_cents: z.number().int(),
  subtotal_cents: z.number().int().nullish(),
  notes: z.string().nullish(),
  fulfilment_type: z.string().nullish().default('collect_at_school'),
  items: z.array(OrderItemSchema),
  created_at: z.string(),
  updated_at: z.string().nullish(),
  cancellation_reason: z.string().nullish(),
});

export const CatalogResponseSchema = z.object({
  success: z.boolean().nullish(),
  items: z.array(CatalogItemSchema).nullish(),
  data: z.array(CatalogItemSchema).or(z.object({ items: z.array(CatalogItemSchema) })).nullish(),
});

export const SingleCatalogItemResponseSchema = z.object({
  success: z.boolean().nullish(),
  item: CatalogItemSchema.nullish(),
  data: CatalogItemSchema.or(z.object({ item: CatalogItemSchema })).nullish(),
});

export const CreateOrderRequestSchema = z.object({
  order: z.object({
    school_id: z.string(),
    parent_id: z.string().nullish(),
    parent_email: z.string().nullish(),
    learner_id: z.string(),
    learner_name: z.string().nullish(),
    learner_grade: z.string().nullish(),
    notes: z.string().nullish(),
    fulfilment_type: z.string().default('collect_at_school'),
    items: z.array(OrderItemRequestSchema),
  }),
});

export const OrderResponseSchema = z.object({
  success: z.boolean().nullish(),
  order: OrderSchema.nullish(),
  data: OrderSchema.or(z.object({ order: OrderSchema })).nullish(),
  message: z.string().nullish(),
});

export const OrdersListResponseSchema = z.object({
  success: z.boolean().nullish(),
  orders: z.array(OrderSchema).nullish(),
  data: z.array(OrderSchema).or(z.object({ orders: z.array(OrderSchema) })).nullish(),
});

// ============================================================================
// TYPES INFERRED FROM SCHEMAS
// ============================================================================

export type ItemVariant = z.infer<typeof ItemVariantSchema>;
export type PrintOptionsConfig = z.infer<typeof PrintOptionsConfigSchema>;
export type CatalogItem = z.infer<typeof CatalogItemSchema>;
export type SelectedPrintOptions = z.infer<typeof SelectedPrintOptionsSchema>;
export type OrderItemRequest = z.infer<typeof OrderItemRequestSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrderPayload = z.infer<typeof CreateOrderRequestSchema>;

export interface CatalogFilterParams {
  category?: string;
  subcategory?: string;
  grade_id?: string;
  grade_name?: string;
  search?: string;
}

// ============================================================================
// SHOP API CLIENT CLASS
// ============================================================================

export class ShopAPI {
  /**
   * List catalog items for a given school, with optional category/grade filtering.
   */
  static async listCatalogItems(
    schoolId: string,
    filters?: CatalogFilterParams
  ): Promise<CatalogItem[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.subcategory) {
      params.append('subcategory', filters.subcategory);
    }
    if (filters?.grade_id) {
      params.append('grade_id', filters.grade_id);
    }
    if (filters?.grade_name) {
      params.append('grade', filters.grade_name);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = `/api/v1/schools/${encodeURIComponent(schoolId)}/catalog_items${
      queryString ? `?${queryString}` : ''
    }`;

    const res = await apiClient.get(endpoint, z.any());

    if (Array.isArray(res)) {
      return res;
    }
    if (Array.isArray(res?.items)) {
      return res.items;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res?.data?.items)) {
      return res.data.items;
    }
    return [];
  }

  /**
   * Fetch a single catalog item by ID.
   */
  static async getCatalogItem(itemId: string): Promise<CatalogItem> {
    const endpoint = `/api/v1/catalog_items/${encodeURIComponent(itemId)}`;
    const res = await apiClient.get(endpoint, z.any());
    const item = res?.item || res?.data?.item || res?.data || res;
    return CatalogItemSchema.parse(item);
  }

  /**
   * Create a new school shop order / request.
   */
  static async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const endpoint = '/api/v1/orders';
    const res = await apiClient.post(endpoint, payload, z.any());
    const order = res?.order || res?.data?.order || res?.data || res;
    return OrderSchema.parse(order);
  }

  /**
   * List parent orders, optionally filtered by school or learner.
   */
  static async listOrders(params: {
    schoolId?: string;
    parentId?: string;
    learnerId?: string;
    email?: string;
  }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params.schoolId) query.append('school_id', params.schoolId);
    if (params.parentId) query.append('parent_id', params.parentId);
    if (params.learnerId) query.append('learner_id', params.learnerId);
    if (params.email) query.append('email', params.email);

    const queryString = query.toString();
    const endpoint = `/api/v1/orders${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get(endpoint, z.any());

    if (Array.isArray(res)) {
      return res;
    }
    if (Array.isArray(res?.orders)) {
      return res.orders;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
    }
    if (Array.isArray(res?.data?.orders)) {
      return res.data.orders;
    }
    return [];
  }

  /**
   * Get single order by ID.
   */
  static async getOrder(orderId: string): Promise<Order> {
    const endpoint = `/api/v1/orders/${encodeURIComponent(orderId)}`;
    const res = await apiClient.get(endpoint, z.any());
    const order = res?.order || res?.data?.order || res?.data || res;
    return OrderSchema.parse(order);
  }

  /**
   * Cancel an order (allowed only while status is 'placed').
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const endpoint = `/api/v1/orders/${encodeURIComponent(orderId)}/cancel`;
    const res = await apiClient.post(endpoint, { reason: reason || 'Cancelled by parent' }, z.any());
    const order = res?.order || res?.data?.order || res?.data || res;
    return OrderSchema.parse(order);
  }
}
