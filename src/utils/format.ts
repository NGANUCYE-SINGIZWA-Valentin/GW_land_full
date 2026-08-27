/**
 * Format a number with K, M, B suffixes for compact display.
 * 
 * Examples:
 *   1_000_000_000  → "1B"
 *   350_000_000    → "350M"
 *   85_000_000     → "85M"
 *   1_500          → "1.5K"
 *   500            → "500"
 */
export function formatCompactPrice(price?: number | null): string {
  if (price === undefined || price === null || isNaN(price)) return '0';
  if (price >= 1_000_000_000) {
    const value = price / 1_000_000_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}B`;
  }
  if (price >= 1_000_000) {
    const value = price / 1_000_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    const value = price / 1_000;
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`;
  }
  return price.toString();
}

/**
 * Format an ISO timestamp as a short relative time (e.g. "2 min ago", "3 hours ago", "5 days ago").
 */
export function formatRelativeTime(isoDate?: string | null): string {
  if (!isoDate) return 'recently';
  const timestamp = new Date(isoDate).getTime();
  if (isNaN(timestamp)) return 'recently';
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return new Date(isoDate).toLocaleDateString();
}

/**
 * General currency formatter fallback (defaults to RWF if base number provided).
 */
export function formatCurrency(priceRwf?: number | string | null, priceUsd?: number | string | null): string {
  const numRwf = Number(priceRwf);
  const numUsd = Number(priceUsd);
  if (!isNaN(numRwf) && numRwf > 0) {
    return `RWF ${Math.round(numRwf).toLocaleString()}`;
  }
  if (!isNaN(numUsd) && numUsd > 0) {
    return `$ ${Math.round(numUsd).toLocaleString()}`;
  }
  return 'Price on request';
}

/** Initials for an avatar badge, e.g. "Sarah Johnson" -> "SJ". */
export function initials(name?: string | null): string {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
