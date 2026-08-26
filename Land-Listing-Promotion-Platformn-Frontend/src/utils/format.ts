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
export function formatCompactPrice(price: number): string {
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
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
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

/** Initials for an avatar badge, e.g. "Sarah Johnson" -> "SJ". */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
