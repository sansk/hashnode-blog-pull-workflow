const moment = require('moment');

/**
 * Helper class for date formatting and manipulation
 */
class DateHelper {
  /**
   * Format date according to specified format
   * @param {string|Date} date - Date to format
   * @param {string} format - Moment.js format string or 'relative'
   * @returns {string} Formatted date string
   */
  static formatDate(date, format = 'MMM DD, YYYY') {
    if (!date) {
      return 'Unknown date';
    }

    try {
      const momentDate = moment(date);

      if (!momentDate.isValid()) {
        return 'Invalid date';
      }

      if (format === 'relative') {
        return DateHelper.getRelativeTime(momentDate);
      }

      return momentDate.format(format);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
  }

  /**
   * Get relative time (e.g., "2 days ago")
   * @param {moment.Moment} momentDate - Moment date object
   * @returns {string} Relative time string
   */
  static getRelativeTime(momentDate) {
    const now = moment();
    const diffInDays = now.diff(momentDate, 'days');
    const diffInHours = now.diff(momentDate, 'hours');
    const diffInMinutes = now.diff(momentDate, 'minutes');
    const diffInWeeks = now.diff(momentDate, 'weeks');
    const diffInMonths = now.diff(momentDate, 'months');
    const diffInYears = now.diff(momentDate, 'years');

    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    } else {
      return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    }
  }

  /**
   * Parse date from various formats
   * @param {string|Date} date - Date to parse
   * @returns {moment.Moment|null} Parsed moment date or null if invalid
   */
  static parseDate(date) {
    if (!date) {
      return null;
    }

    try {
      const momentDate = moment(date);
      return momentDate.isValid() ? momentDate : null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  /**
   * Check if date is valid
   * @param {string|Date} date - Date to validate
   * @returns {boolean} Whether date is valid
   */
  static isValidDate(date) {
    return DateHelper.parseDate(date) !== null;
  }

  /**
   * Get date in ISO format
   * @param {string|Date} date - Date to convert
   * @returns {string} ISO date string
   */
  static toISOString(date) {
    const momentDate = DateHelper.parseDate(date);
    return momentDate ? momentDate.toISOString() : '';
  }

  /**
   * Format date for URL slug
   * @param {string|Date} date - Date to format
   * @returns {string} URL-safe date string
   */
  static toUrlSlug(date) {
    const momentDate = DateHelper.parseDate(date);
    return momentDate ? momentDate.format('YYYY-MM-DD') : '';
  }

  /**
   * Get common date formats with examples
   * @param {string|Date} sampleDate - Sample date to use for examples
   * @returns {Object} Object with format keys and example values
   */
  static getFormatExamples(sampleDate = new Date()) {
    const momentDate = moment(sampleDate);

    return {
      'MMM DD, YYYY': momentDate.format('MMM DD, YYYY'),
      'DD/MM/YYYY': momentDate.format('DD/MM/YYYY'),
      'MM/DD/YYYY': momentDate.format('MM/DD/YYYY'),
      'YYYY-MM-DD': momentDate.format('YYYY-MM-DD'),
      'MMMM Do, YYYY': momentDate.format('MMMM Do, YYYY'),
      'MMM YYYY': momentDate.format('MMM YYYY'),
      'DD MMM YYYY': momentDate.format('DD MMM YYYY'),
      'ddd, MMM DD': momentDate.format('ddd, MMM DD'),
      relative: DateHelper.getRelativeTime(momentDate)
    };
  }

  /**
   * Sort dates in descending order (newest first)
   * @param {Array} items - Array of objects with date property
   * @param {string} dateProperty - Property name containing the date
   * @returns {Array} Sorted array
   */
  static sortByDateDesc(items, dateProperty = 'publishedAt') {
    return items.sort((a, b) => {
      const dateA = moment(a[dateProperty]);
      const dateB = moment(b[dateProperty]);

      if (!dateA.isValid() && !dateB.isValid()) return 0;
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;

      return dateB.diff(dateA);
    });
  }

  /**
   * Sort dates in ascending order (oldest first)
   * @param {Array} items - Array of objects with date property
   * @param {string} dateProperty - Property name containing the date
   * @returns {Array} Sorted array
   */
  static sortByDateAsc(items, dateProperty = 'publishedAt') {
    return items.sort((a, b) => {
      const dateA = moment(a[dateProperty]);
      const dateB = moment(b[dateProperty]);

      if (!dateA.isValid() && !dateB.isValid()) return 0;
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;

      return dateA.diff(dateB);
    });
  }

  /**
   * Filter items by date range
   * @param {Array} items - Array of objects with date property
   * @param {string|Date} startDate - Start date (inclusive)
   * @param {string|Date} endDate - End date (inclusive)
   * @param {string} dateProperty - Property name containing the date
   * @returns {Array} Filtered array
   */
  static filterByDateRange(items, startDate, endDate, dateProperty = 'publishedAt') {
    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      return items;
    }

    return items.filter(item => {
      const itemDate = moment(item[dateProperty]);
      return (
        itemDate.isValid() &&
        itemDate.isSameOrAfter(start, 'day') &&
        itemDate.isSameOrBefore(end, 'day')
      );
    });
  }
}

module.exports = { DateHelper };
