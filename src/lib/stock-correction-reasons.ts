export const STOCK_CORRECTION_REASONS = [
  "Physical count",
  "Damaged or expired",
  "Lost or missing",
  "Found extra stock",
  "Supplier return",
  "Other",
] as const;

export type StockCorrectionReason = (typeof STOCK_CORRECTION_REASONS)[number];
