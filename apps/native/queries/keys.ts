/**
 * Centralized query key factory for all TanStack Query hooks.
 * Structured keys prevent over-invalidation and enable precise cache management.
 */

// Filter shapes
export type DuesFilters = {
  month?: string;
  status?: "PENDING" | "PAID";
};

export type ComplaintsFilters = {
  status?: "PENDING" | "IN_PROGRESS" | "RESOLVED";
};

export const queryKeys = {
  // ─── Auth / Membership ────────────────────────────────────────────────────
  membership: (userId?: string) => ["my-membership", userId] as const,

  // ─── Society Structure ─────────────────────────────────────────────────────
  towers: () => ["towers"] as const,
  members: () => ["members"] as const,
  myFlats: () => ["my-flats"] as const,

  // ─── Notices ──────────────────────────────────────────────────────────────
  notices: () => ["notices"] as const,

  // ─── Polls ────────────────────────────────────────────────────────────────
  polls: () => ["polls"] as const,

  // ─── Complaints ───────────────────────────────────────────────────────────
  complaints: (filters?: ComplaintsFilters) => ["complaints", filters] as const,

  // ─── Amenities ────────────────────────────────────────────────────────────
  amenities: () => ["amenities"] as const,

  // ─── Staff ────────────────────────────────────────────────────────────────
  staff: () => ["staff"] as const,

  // ─── Dues & Billing ───────────────────────────────────────────────────────
  dues: {
    admin: (filters?: DuesFilters) => ["dues", "admin", filters] as const,
    resident: () => ["dues", "resident"] as const,
  },

  // ─── Visitors ─────────────────────────────────────────────────────────────
  visitors: {
    pending: () => ["visitors", "pending"] as const,
    active: () => ["visitors", "active"] as const,
    history: () => ["visitors", "history"] as const,
  },

  // ─── Residents search ─────────────────────────────────────────────────────
  residents: (search: string) => ["residents", search] as const,
  
  // ─── Event Bookings ───────────────────────────────────────────────────────
  bookings: () => ["bookings"] as const,

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: () => ["notifications"] as const,

  // ─── Treasury & Budgeting ──────────────────────────────────────────────────
  treasury: {
    budgets: () => ["treasury", "budgets"] as const,
    expenses: (category?: string) => ["treasury", "expenses", category] as const,
    festivals: () => ["treasury", "festivals"] as const,
    fds: () => ["treasury", "fds"] as const,
    blockSummaries: () => ["treasury", "reports", "blocks"] as const,
  },
} as const;
