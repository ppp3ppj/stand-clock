/**
 * Time Utility Functions
 * Provides reusable time formatting and conversion utilities
 */

/**
 * Format seconds as MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string (MM:SS)
 */
export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format seconds as hours and minutes
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "2h 30m" or "45m")
 */
export function formatTimeHoursMinutes(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format minutes as MM:SS
 * @param minutes - Time in minutes (can be decimal)
 * @returns Formatted time string (MM:SS)
 */
export function formatMinutesAsMMSS(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert minutes to seconds
 * @param minutes - Time in minutes
 * @returns Time in seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Convert seconds to minutes
 * @param seconds - Time in seconds
 * @returns Time in minutes (rounded)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
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
