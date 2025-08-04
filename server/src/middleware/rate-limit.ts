import { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      ...config,
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  private getKey(c: Context): string {
    // Use IP address as the key, with user ID if authenticated
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               'unknown';
    const userId = c.get('user')?.id;
    return userId ? `${userId}:${ip}` : ip;
  }

  middleware() {
    return async (c: Context, next: Next) => {
      const key = this.getKey(c);
      const now = Date.now();

      let requestData = this.requests.get(key);

      if (!requestData || now > requestData.resetTime) {
        requestData = {
          count: 0,
          resetTime: now + this.config.windowMs,
        };
        this.requests.set(key, requestData);
      }

      requestData.count++;

      // Set rate limit headers
      c.header('X-RateLimit-Limit', this.config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - requestData.count).toString());
      c.header('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

      if (requestData.count > this.config.maxRequests) {
        return c.json(
          {
            error: 'Rate limit exceeded',
            message: this.config.message,
            retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
          },
          429
        );
      }

      await next();

      // If configured to skip successful requests, decrement counter for successful responses
      if (this.config.skipSuccessfulRequests && c.res.status < 400) {
        requestData.count = Math.max(0, requestData.count - 1);
      }
    };
  }
}

// Create different rate limiters for different endpoints
export const generalRateLimit = new RateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

export const authRateLimit = new RateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'API rate limit exceeded, please slow down.',
  skipSuccessfulRequests: true,
});