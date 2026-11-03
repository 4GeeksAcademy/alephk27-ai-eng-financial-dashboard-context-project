import type { BusinessType, GroupBy, OperationType } from "./api-types";

/**
 * Optional inclusive date bounds shared by metrics endpoints.
 * The API accepts either bound independently; omit both to include all dates.
 */
export interface DateRangeFilter {
  /** Inclusive lower bound, formatted YYYY-MM-DD; omit to leave the start unbounded. */
  start_date?: string;
  /** Inclusive upper bound, formatted YYYY-MM-DD; omit to leave the end unbounded. */
  end_date?: string;
}

/** Query parameters accepted by GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Alert threshold as a ratio. The API default is 0.3 and its minimum is 0;
   * the API declares no maximum. The product UI brief asks to constrain input to 0.01–1.0.
   */
  threshold?: number;
  /** Aggregation period: day, week, or month; API default is month. */
  group_by?: GroupBy;
  /** Optional business segment filter: B2B or B2C. */
  business_type?: BusinessType;
}

/** Query parameters accepted by GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation selector: income or outcome; API default is outcome. */
  operation_type?: OperationType;
  /** Maximum number of category rows, integer from 1 to 20; API default is 5. */
  limit?: number;
  /** Optional business segment selector: B2B or B2C. */
  business_type?: BusinessType;
}
