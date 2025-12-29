// Logging & Analytics Service for TapMove Merchant Terminal
// Provides structured logging with support for analytics integration

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

interface PaymentCreatedData {
  paymentId: string;
  amount: string;
  description?: string;
}

interface PaymentCompletedData extends PaymentCreatedData {
  transactionHash: string;
  payer: string;
  duration: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 100;
  private sessionId: string;
  private merchantId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  setMerchantId(merchantId: string | null) {
    this.merchantId = merchantId;
    if (merchantId) {
      this.info('Merchant session started', { merchantId: merchantId.slice(0, 8) + '...' });
    }
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      data: {
        ...data,
        sessionId: this.sessionId,
        merchantId: this.merchantId,
      },
      timestamp: new Date().toISOString(),
    };

    // Store locally
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
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
  paymentCreated(data: PaymentCreatedData) {
    this.info('Payment created', data as unknown as Record<string, unknown>);
  }

  paymentCompleted(data: PaymentCompletedData) {
    this.info('Payment completed', data as unknown as Record<string, unknown>);
  }

  paymentExpired(paymentId: string) {
    this.info('Payment expired', { paymentId });
  }

  paymentCancelled(paymentId: string) {
    this.info('Payment cancelled', { paymentId });
  }

  // User flow logging
  pageView(pageName: string) {
    this.info('Page viewed', { page: pageName });
  }

  userAction(action: string, data?: Record<string, unknown>) {
    this.info('User action', { action, ...data });
  }

  // NFC-specific logging
  nfcBroadcast(paymentId: string, success: boolean) {
    this.info('NFC broadcast', { paymentId, success });
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
