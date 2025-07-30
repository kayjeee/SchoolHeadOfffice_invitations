/**
 * ==================================================================================
 * AUTHENTICATION MODULE - NASA-STYLE LOGGER UTILITY
 * ==================================================================================
 *
 * This utility provides a standardized NASA-compliant logging function for the
 * authentication module, ensuring consistent log formatting and enhanced observability.
 *
 * NASA-STYLE LOGGING STANDARDS:
 * [SEVERITY] [TIMESTAMP] [MODULE] :: [MESSAGE] [CONTEXT]
 *
 * Severity Levels (NASA Standard):
 * - EMERG:   System is unusable, immediate attention required
 * - ALERT:   Action must be taken immediately
 * - CRIT:    Critical conditions, system functionality at risk
 * - ERROR:   Error conditions, but system continues operating
 * - WARN:    Warning conditions, potential issues
 * - NOTICE:  Normal but significant conditions
 * - INFO:    Informational messages, general system state
 * - DEBUG:   Debug-level messages, detailed execution flow
 *
 * @author Kagiso
 * @version 1.0.0 // Initial release as a reusable utility
 * @created 2025-06-21
 */

/**
 * NASA-compliant logging function that creates structured, searchable log entries.
 * This function is designed to be highly reusable across different components
 * within the authentication module and potentially other parts of the application
 * that require structured logging.
 *
 * @param {string} severity - Log severity level (EMERG, ALERT, CRIT, ERROR, WARN, NOTICE, INFO, DEBUG).
 * @param {string} module - Source module/component name (e.g., 'AUTH_FLOW', 'AUTH_API', 'GRAPHQL_DB').
 * @param {string} message - Human-readable log message describing the event.
 * @param {object} [context] - Optional: Additional structured data relevant to the log entry.
 * This can include IDs, status codes, or other diagnostic info.
 *
 * @example
 * // Example of an informational log
 * nasaLog('INFO', 'AUTH_PROVIDER', 'User session established', { userId: 'usr_123abc', email: 'user@example.com' });
 *
 * // Example of an error log with detailed context
 * nasaLog('ERROR', 'GRAPHQL_DB', 'Failed to fetch user data', {
 * auth0_id: 'auth0|xyz789',
 * errorCode: 'DB_QUERY_FAILED',
 * originalError: 'Network timeout',
 * retryAttempt: 3
 * });
 */
export const nasaLog = (severity: string, module: string, message: string, context?: object) => {
  // Generate ISO 8601 timestamp for global consistency and ease of sorting
  const timestamp = new Date().toISOString();

  // Construct the log entry object, spreading context for additional fields
  const logEntry = {
    timestamp,    // When the event occurred (ISO string)
    severity,     // How critical the event is (e.g., INFO, ERROR, CRIT)
    module,       // Which component generated this log (e.g., AUTH_FLOW, AUTH_SERVICE)
    message,      // Human-readable description of the event
    ...context    // Any additional data for structured analysis
  };

  // Output the log entry as a JSON string to the console.
  // This format is ideal for structured logging systems (e.g., ELK Stack, Splunk, CloudWatch Logs).
  console.log(JSON.stringify(logEntry));
};