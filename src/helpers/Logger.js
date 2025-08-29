const core = require('@actions/core');
const getInput = core.getInput;
const warning = core.warning;
const _error = core.error;
const _debug = core.debug;
const _startGroup = core.startGroup;
const _endGroup = core.endGroup;

/**
 * Logger helper class for consistent logging across the application
 */
class Logger {
  constructor(context = '✍️ Hashnode-Blog-Pull-Action') {
    this.context = context;
    this.isDebugEnabled = process.env.RUNNER_DEBUG === '1' || getInput('debug') === 'true';
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  info(message, data = null) {
    const formattedMessage = this.formatMessage('ℹ️ INFO', message);
    console.log(formattedMessage);

    if (data) {
      console.log(this.formatData(data));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  warn(message, data = null) {
    const formattedMessage = this.formatMessage('⚠️ WARN', message);
    console.warn(formattedMessage);
    warning(message);

    if (data) {
      console.warn(this.formatData(data));
    }
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error|any} error - Error object or data to log
   */
  error(message, error = null) {
    const formattedMessage = this.formatMessage('❌ ERROR', message);
    console.error(formattedMessage);
    _error(message);

    if (error) {
      if (error instanceof Error) {
        console.error(this.formatError(error));
        _error(error.stack || error.message);
      } else {
        console.error(this.formatData(error));
      }
    }
  }

  /**
   * Log debug message (only in debug mode)
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  debug(message, data = null) {
    if (!this.isDebugEnabled) {
      return;
    }

    const formattedMessage = this.formatMessage('🔍 DEBUG', message);
    console.log(formattedMessage);
    _debug(message);

    if (data) {
      console.log(this.formatData(data));
    }
  }

  /**
   * Log success message
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  success(message, data = null) {
    const formattedMessage = this.formatMessage('✅ SUCCESS', message);
    console.log(formattedMessage);

    if (data) {
      console.log(this.formatData(data));
    }
  }

  /**
   * Start a log group
   * @param {string} title - Group title
   */
  startGroup(title) {
    _startGroup(title);
    this.info(`Starting: ${title}`);
  }

  /**
   * End the current log group
   */
  endGroup() {
    _endGroup();
  }

  /**
   * Log with custom level
   * @param {string} level - Log level
   * @param {string} message - Message to log
   * @param {any} data - Optional data to log
   */
  log(level, message, data = null) {
    const formattedMessage = this.formatMessage(level.toUpperCase(), message);
    console.log(formattedMessage);

    if (data) {
      console.log(this.formatData(data));
    }
  }

  /**
   * Format log message with timestamp and context
   * @param {string} level - Log level
   * @param {string} message - Message to format
   * @returns {string} Formatted message
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.context}] ${message}`;
  }

  /**
   * Format data for logging
   * @param {any} data - Data to format
   * @returns {string} Formatted data
   */
  formatData(data) {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  }

  /**
   * Format error for logging
   * @param {Error} error - Error to format
   * @returns {string} Formatted error
   */
  formatError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.response && {
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        }
      })
    };
  }

  /**
   * Create a child logger with additional context
   * @param {string} childContext - Additional context
   * @returns {Logger} Child logger instance
   */
  child(childContext) {
    const fullContext = `${this.context}:${childContext}`;
    return new Logger(fullContext);
  }

  /**
   * Measure execution time of an async function
   * @param {string} operationName - Name of the operation
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} Result of the operation
   */
  async time(operationName, operation) {
    const startTime = Date.now();
    this.debug(`Starting operation: ${operationName}`);

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.debug(`Operation completed: ${operationName} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(`Operation failed: ${operationName} (${duration}ms)`, error);
      throw error;
    }
  }

  /**
   * Log performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {string} unit - Unit of measurement
   */
  metric(metric, value, unit = '') {
    const message = `Metric: ${metric} = ${value}${unit}`;
    this.info(message);

    // Also log as GitHub Actions output if running in Actions environment
    if (process.env.GITHUB_ACTIONS) {
      (`metric_${metric.toLowerCase().replace(/\s+/g, '_')}`, value);
    }
  }

  /**
   * Log progress of an operation
   * @param {number} current - Current progress value
   * @param {number} total - Total progress value
   * @param {string} operation - Operation description
   */
  progress(current, total, operation = 'Processing') {
    const percentage = Math.round((current / total) * 100);
    const message = `${operation}: ${current}/${total} (${percentage}%)`;
    this.info(message);
  }
}

module.exports = { Logger };
