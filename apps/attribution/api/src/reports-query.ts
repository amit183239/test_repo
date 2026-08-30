/**
 * reports-query.ts
 *
 * Optimised aggregate query for the attribution reports page.
 * Replaces the previous full-table scan with an indexed aggregate,
 * cutting load time significantly on large accounts.
 *
 * Fixes: https://github.com/amit183239/test_repo/issues/27
 */

export function buildReportsQuery(accountId: string, dateFrom: string, dateTo: string): string {
  // Previously: SELECT * FROM conversions WHERE account_id = ? (full scan)
  // Now: use the covering index on (account_id, converted_at) with aggregation pushed down
  return `
    SELECT
      source,
      COUNT(*) AS conversions,
      SUM(revenue_cents) AS total_revenue_cents
    FROM conversions
    WHERE account_id = ?
      AND converted_at BETWEEN ? AND ?
    GROUP BY source
    ORDER BY conversions DESC
  `;
}
