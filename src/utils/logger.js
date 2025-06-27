/**
 * Date: 2025-06-25
 * File Purpose: Centralized logging utility with debug levels and structured output
 * Project: MongoDB AI Hub
 * Directory Path: /Users/chrisdavis/Projects/mongodb-ai-hub/src/utils/logger.js
 */

const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Current log level from environment or default to INFO
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const logFiles = {
  error: path.join(logsDir, 'error.log'),
  combined: path.join(logsDir, 'combined.log'),
  debug: path.join(logsDir, 'debug.log'),
  test: path.join(logsDir, 'test.log')
};

/**
 * Format log message with timestamp, level, and context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context data
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const processInfo = {
    pid: process.pid,
    env: process.env.NODE_ENV || 'development'
  };

  const logEntry = {
    timestamp,
    level,
    message,
    process: processInfo,
    ...context
  };

  return JSON.stringify(logEntry) + '\n';
};

/**
 * Write log to file
 * @param {string} filePath - Path to log file
 * @param {string} message - Formatted log message
 */
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message);
  } catch (error) {
    // Fallback to console if file write fails
    console.error('Failed to write to log file:', error.message);
  }
};

/**
 * Core logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
const log = (level, message, context = {}) => {
  const levelNum = LOG_LEVELS[level.toUpperCase()];

  // Only log if current level allows it
  if (levelNum > CURRENT_LOG_LEVEL) {
    return;
  }

  const formattedMessage = formatLogMessage(level, message, context);

  // Always write to combined log
  writeToFile(logFiles.combined, formattedMessage);

  // Write to specific log files based on level
  if (level === 'ERROR') {
    writeToFile(logFiles.error, formattedMessage);
  }

  if (levelNum >= LOG_LEVELS.DEBUG) {
    writeToFile(logFiles.debug, formattedMessage);
  }

  // Write to test log during testing
  if (process.env.NODE_ENV === 'test') {
    writeToFile(logFiles.test, formattedMessage);
  }

  // Console output with colors
  const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
    TRACE: '\x1b[37m'  // White
  };

  const resetColor = '\x1b[0m';
  const colorCode = colors[level.toUpperCase()] || '';

  console.log(`${colorCode}[${level.toUpperCase()}]${resetColor} ${message}`, context);
};

/**
 * Create module-specific logger
 * @param {string} module - Module name
 * @returns {Object} Logger instance for module
 */
const createModuleLogger = (module) => {
  return {
    error: (message, context = {}) => log('ERROR', message, { module, ...context }),
    warn: (message, context = {}) => log('WARN', message, { module, ...context }),
    info: (message, context = {}) => log('INFO', message, { module, ...context }),
    debug: (message, context = {}) => log('DEBUG', message, { module, ...context }),
    trace: (message, context = {}) => log('TRACE', message, { module, ...context })
  };
};

/**
 * Log function entry with parameters
 * @param {string} module - Module name
 * @param {string} functionName - Function name
 * @param {Object} params - Function parameters
 */
const logFunctionEntry = (module, functionName, params = {}) => {
  log('TRACE', `ENTRY: ${functionName}`, {
    module,
    function: functionName,
    params: sanitizeParams(params),
    entryTime: Date.now()
  });
};

/**
 * Log function exit with result
 * @param {string} module - Module name
 * @param {string} functionName - Function name
 * @param {any} result - Function result
 * @param {number} startTime - Function start time
 */
const logFunctionExit = (module, functionName, result, startTime) => {
  const duration = startTime ? Date.now() - startTime : 0;
  log('TRACE', `EXIT: ${functionName}`, {
    module,
    function: functionName,
    duration: `${duration}ms`,
    success: true,
    resultType: typeof result
  });
};

/**
 * Log function error
 * @param {string} module - Module name
 * @param {string} functionName - Function name
 * @param {Error} error - Error object
 * @param {number} startTime - Function start time
 */
const logFunctionError = (module, functionName, error, startTime) => {
  const duration = startTime ? Date.now() - startTime : 0;
  log('ERROR', `ERROR: ${functionName}`, {
    module,
    function: functionName,
    duration: `${duration}ms`,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });
};

/**
 * Sanitize parameters to remove sensitive data
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
const sanitizeParams = (params) => {
  const sanitized = { ...params };
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Clear log files
 */
const clearLogs = () => {
  Object.values(logFiles).forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
      }
    } catch (error) {
      console.error(`Failed to clear log file ${filePath}:`, error.message);
    }
  });
};

// Main logger instance
const logger = createModuleLogger('MAIN');

module.exports = {
  logger,
  createModuleLogger,
  logFunctionEntry,
  logFunctionExit,
  logFunctionError,
  clearLogs,
  LOG_LEVELS,
  logFiles
};

/**
 * Future Improvements:
 * - Add log rotation by size and date
 * - Implement log streaming for real-time monitoring
 * - Add structured logging for better parsing
 * - Implement log aggregation for distributed systems
 * - Add performance metrics logging
 * - Implement log filtering and searching
 * - Add log compression for storage optimization
 * - Implement secure log transmission
 */
