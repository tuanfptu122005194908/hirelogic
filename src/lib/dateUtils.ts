/**
 * Date utilities for challenge system
 * Handles timezone correctly using local time
 */

/**
 * Get current local date string (YYYY-MM-DD) in user's timezone
 */
export const getLocalDateString = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get end of day timestamp (23:59:59) for a given date string
 */
export const getEndOfDay = (dateStr: string): Date => {
  const date = new Date(dateStr + 'T23:59:59');
  return date;
};

/**
 * Check if a date string is today (in local timezone)
 */
export const isToday = (dateStr: string): boolean => {
  const today = getLocalDateString();
  return dateStr === today;
};

/**
 * Check if current time is before deadline (end of day)
 */
export const isBeforeDeadline = (dateStr: string): boolean => {
  const deadline = getEndOfDay(dateStr);
  return new Date() < deadline;
};

/**
 * Get the date difference in days (using local dates)
 */
export const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
  // Parse as local dates at midnight
  const date1 = new Date(dateStr1 + 'T00:00:00');
  const date2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is yesterday (in local timezone)
 */
export const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === getLocalDateString(yesterday);
};

/**
 * Get deadline string for a date (YYYY-MM-DDTHH:mm:ss+07:00 format)
 */
export const getDeadlineString = (dateStr: string): string => {
  const date = new Date(dateStr + 'T23:59:59');
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const offsetSign = offset >= 0 ? '+' : '-';
  const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetStr}`;
};
