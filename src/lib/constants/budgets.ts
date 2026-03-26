// Budget constants and category mappings for cost tracking

export const ASSET_TYPE_TO_CATEGORY: Record<string, string> = {
  piling: "structural",
  electrical_pedestal: "electrical",
  water_connection: "plumbing",
  dock_light: "electrical",
  fire_extinguisher: "safety",
  fuel_pump: "mechanical",
  cleat: "structural",
  bumper: "structural",
  gangway: "structural",
  other: "general",
};

/** Annual budgets in dollars per category */
export const CATEGORY_BUDGETS: Record<string, number> = {
  electrical: 15000,
  structural: 25000,
  plumbing: 8000,
  safety: 5000,
  mechanical: 12000,
  general: 5000,
};

/** Labor rate in cents per minute ($0.75/min = $45/hr) */
export const LABOR_RATE_PER_MINUTE = 75;

/**
 * Month indices (0-based) for each season.
 * null means year_round (always applicable).
 * Spring: Mar(2), Apr(3), May(4)
 * Summer: Jun(5), Jul(6), Aug(7)
 * Fall: Sep(8), Oct(9), Nov(10)
 * Winter: Dec(11), Jan(0), Feb(1)
 */
export const SEASON_MONTHS: Record<string, number[] | null> = {
  spring: [2, 3, 4],
  summer: [5, 6, 7],
  fall: [8, 9, 10],
  winter: [11, 0, 1],
  year_round: null,
};
