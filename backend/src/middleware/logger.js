// Request logging middleware

/**
 * Log incoming requests with timing
 * Logs: METHOD PATH STATUS DURATION
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Skip logging for health check endpoints
  const skipPaths = ['/health', '/api/health', '/favicon.ico'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Color code based on status
    let statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `${req.method.padEnd(6)} ${req.path.padEnd(40)} ${statusColor}${status}${reset} ${duration}ms`
    );
  });

  next();
};

/**
 * Log errors with full details
 */
export const errorLogger = (err, req, res, next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  next(err);
};
