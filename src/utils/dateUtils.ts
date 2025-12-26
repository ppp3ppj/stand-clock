/**
 * Date utility functions for calendar operations
 */

/**
 * Get month name from month index
 * @param month - Month index (0-11)
 * @returns Month name (e.g., "January")
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

/**
 * Get short day name from day index
 * @param dayIndex - Day index (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @returns Short day name (e.g., "Mo")
 */
export function getDayOfWeekShort(dayIndex: number): string {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return days[dayIndex];
}

/**
 * Format date as YYYY-MM-DD for use as Map keys
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get start and end of month
 * @param date - Any date in the target month
 * @returns Object with start and end dates
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

/**
 * Get array of dates for calendar grid (including padding from prev/next months)
 * Returns 35 or 42 dates (5 or 6 weeks) to fill the calendar grid
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Array of Date objects for calendar display
 */
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0=Sunday, 1=Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate start date (including padding from previous month)
  // If month starts on Monday (1), we need 1 day from previous month
  // If month starts on Sunday (0), we need 6 days from previous month (to start grid on Monday)
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const startDate = new Date(year, month, 1 - startOffset);

  // Calculate number of days to display
  // We want to show complete weeks, so we need 35 or 42 days (5 or 6 weeks)
  const daysInMonth = lastDay.getDate();
  const totalDaysNeeded = Math.ceil((daysInMonth + startOffset) / 7) * 7;

  // Generate array of dates
  const days: Date[] = [];
  for (let i = 0; i < totalDaysNeeded; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  return days;
}

/**
 * Add months to a date
 * @param date - Starting date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string (e.g., "December 25, 2025")
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
