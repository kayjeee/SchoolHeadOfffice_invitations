# Parent Portal - School Shop & Request System

## Overview
The School Shop module provides parents with an "Uber Eats"-style mobile-first ordering experience for school-approved items, including:
- **Prints:** Past exam papers, study guides, worksheets, and syllabus assignments.
- **Stationery:** Pencils, notebooks, calculators, and mathematical sets.
- **Uniforms:** School shirts, trousers, skirts, blazers, sportswear, and badges.

Parents can browse their school's catalog filtered automatically by their selected learner's grade, select custom variants (e.g. sizes) and print parameters (copies, colour vs. black & white, single-sided vs. double-sided), manage their cart per learner, and submit requests to the school administration. Submitted requests are tracked in real-time with an Order Status Stepper (`Placed` → `Accepted` → `Preparing` → `Ready for collection` → `Completed`).

---

## Architectural Layout & Routes

```
pages/parent/[school_slug]/dashboard/[email]/shop.tsx
 ├── DashboardShell (Navigation Tab: "school shop" /shop)
 └── ShopTab
      ├── CartProvider (Scoped per school + parent, localStorage persisted)
      ├── LearnerSelector (Switches learner with cart confirmation)
      ├── CategoryChips & SubcategoryChips (Sticky Search + Uber Eats chips)
      ├── CatalogGrid & ItemCard (Responsive cards, stock badges)
      ├── ItemDetailSheet (Bottom sheet / modal, size variant picker & print options)
      ├── CartDrawer & FloatingCartBar (Quantity controls, notes, line totals)
      ├── CheckoutSheet (Review, school collection notice, server-total verification)
      └── OrderList, OrderCard & OrderStatusTracker (Live stepper, cancel-while-placed, reorder)
```

---

## Backend API Contract (`lib/api/shop-api.ts`)

All API interactions flow through the centralized `ApiClient` instance:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/schools/:school_id/catalog_items` | List items with optional query params `category`, `subcategory`, `grade_id`, `search` |
| `GET` | `/api/v1/catalog_items/:id` | Fetch specific item details |
| `POST` | `/api/v1/orders` | Submit a new shop request with item variants, print options, and notes |
| `GET` | `/api/v1/orders` | Retrieve parent requests with query filters (`school_id`, `parent_id`, `email`) |
| `GET` | `/api/v1/orders/:id` | Retrieve specific order details |
| `POST` | `/api/v1/orders/:id/cancel` | Cancel an order while in `placed` status |

### Null-Safety & Schema Resilience
All optional fields use `.nullish()` in Zod to accept either `undefined` or `null` from Rails MongoDB responses without throwing validation errors. Prices are strictly represented as integer cents (`cents`) and rendered with the `formatCurrency` helper in South African Rand (e.g. `R 45.00`).

---

## Key Feature Implementation Details

1. **Grade & Category Filtering:**
   - Selecting a learner automatically filters catalog items matching their grade or open to all grades.
   - Category chips (`All`, `Prints`, `Stationery`, `Uniform`) and dynamic subcategory chips allow one-tap filtering.
2. **Variants & Print Options:**
   - Uniforms support size selections (e.g. `Size 32`, `Medium`) with variant price overrides.
   - Prints support number of copies, colour toggles (with configured surcharges), and double-sided discounts.
3. **Cart & Learner Association:**
   - The request cart is strictly scoped to one learner. Changing learners with non-empty carts prompts confirmation to prevent mismatched orders.
   - Cart data persists in `localStorage` scoped per school and parent identifier with graceful try/catch fallbacks.
4. **Server Price Authority:**
   - Client calculates estimated line totals for responsive UX; upon submission, the server is the single source of truth for final pricing and order number generation.
5. **Request Tracking & Auto-Refresh:**
   - "My Requests" automatically polls every 30 seconds (`refetchInterval: 30000`) and refetches on window focus.
   - Parents can cancel orders while in `placed` status. Once accepted by admin, cancellation is disabled.
   - "Order Again" button automatically repopulates the cart with still-available items while warning of discontinued products.
