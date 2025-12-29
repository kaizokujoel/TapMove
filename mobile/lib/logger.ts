// Logging & Analytics Service for TapMove Mobile
// Provides structured logging with support for analytics integration

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface PaymentAttemptData {
  paymentId: string;
  amount: string;
  merchant: string;
  method: 'qr' | 'nfc' | 'deeplink';
}

interface PaymentResultData extends PaymentAttemptData {
  success: boolean;
  transactionHash?: string;
  error?: string;
  duration?: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 100;
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      this.info('User session started', { userId: userId.slice(0, 8) + '...' });
    }
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      data: {
        ...data,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      timestamp: new Date().toISOString(),
    };

    // Store locally
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (__DEV__) {
      const consoleMethod = level === 'error' ? console.error :
        level === 'warn' ? console.warn : console.log;
      consoleMethod(`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // In production, you would send to analytics service
    // Example: sendToAnalytics(entry);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  // Payment-specific logging
  paymentAttempt(data: PaymentAttemptData) {
    this.info('Payment attempt started', data as unknown as Record<string, unknown>);
  }

  paymentResult(data: PaymentResultData) {
    if (data.success) {
      this.info('Payment completed successfully', data as unknown as Record<string, unknown>);
    } else {
      this.warn('Payment failed', data as unknown as Record<string, unknown>);
    }
  }

  // User flow logging
  screenView(screenName: string) {
    this.info('Screen viewed', { screen: screenName });
  }

  userAction(action: string, data?: Record<string, unknown>) {
    this.info('User action', { action, ...data });
  }

  // NFC-specific logging
  nfcEvent(event: string, data?: Record<string, unknown>) {
    this.info('NFC event', { event, ...data });
  }

  // Performance logging
  performance(metric: string, value: number, data?: Record<string, unknown>) {
    this.info('Performance metric', { metric, value, ...data });
  }

  // Get recent logs for debugging
  getRecentLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Export logs (for bug reports)
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
