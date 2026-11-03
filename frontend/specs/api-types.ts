/** Operation values exposed by the metrics API. */
export type OperationType = "income" | "outcome";

/** Business segments exposed by the metrics API. */
export type BusinessType = "B2B" | "B2C";

/** Category values exposed by the metrics API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Aggregation periods accepted by summary and alert endpoints. */
export type GroupBy = "day" | "week" | "month";

/**
 * Response from GET /api/metrics/facets.
 * Facets list values present in the full dataset; they are not separated by business type.
 */
export interface FacetResponse {
  /** Operation values present in the dataset: "income" and/or "outcome". */
  operation_types: OperationType[];
  /** Business segments present in the dataset: "B2B" and/or "B2C". */
  business_types: BusinessType[];
  /** Categories present in the dataset; not grouped by business segment. */
  categories: Category[];
  /** Earliest dataset date as YYYY-MM-DD, or null when the dataset has no movements. */
  min_date: string | null;
  /** Latest dataset date as YYYY-MM-DD, or null when the dataset has no movements. */
  max_date: string | null;
}

/**
 * One item returned by GET /api/metrics/alerts.
 * `baseline_average` reflects the API's average of all earlier grouped periods,
 * not specifically the three prior periods requested in the product brief.
 */
export interface AlertTiny {
  /** Aggregated period key; formatting depends on group_by (day, week, or month). */
  period: string;
  /** Total outcome amount for this period. */
  outcome_total: number;
  /** API baseline: average outcome across all preceding periods in the filtered summary. */
  baseline_average: number;
  /** Increase relative to the baseline as a ratio (for example, 0.3 means 30%). */
  increase_ratio: number;
}

/** Array response from GET /api/metrics/alerts; an empty array means no alert rows. */
export type AlertResponse = AlertTiny[];

/**
 * One item returned by GET /api/metrics/categories/top.
 * The endpoint does not return the percentage of the group's income total.
 */
export interface CategoryEntry {
  /** Category identifier from the API's Category enum. */
  category: Category;
  /** Operation represented by this top-category result. */
  operation_type: OperationType;
  /** Sum of movement amounts for this category and operation in the selected filters. */
  total_amount: number;
}

/** Array response from GET /api/metrics/categories/top; may contain fewer than limit rows. */
export type TopCategoriesResponse = CategoryEntry[];
