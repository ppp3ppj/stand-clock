/**
 * Date Utility Functions
 * Provides reusable date formatting and manipulation utilities
 */

/**
 * Get date string in YYYY-MM-DD format
 * @param daysAgo - Number of days in the past (0 = today)
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateString(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date string in YYYY-MM-DD format
 * @returns Today's date string
 */
export function getTodayDateString(): string {
  return getDateString(0);
}

/**
 * Format date string for display
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Jan 15")
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Check if a date string is today
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns True if the date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Get date range for past N days
 * @param days - Number of days to go back
 * @returns Array of date strings [oldest, ..., newest]
 */
export function getDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => getDateString(days - 1 - i));
}

/**
 * Calculate duration between two dates in seconds
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration in seconds
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
}
