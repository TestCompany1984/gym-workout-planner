import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);

    // Handle HTTP exceptions (thrown by Hono)
    if (error instanceof HTTPException) {
      return c.json(
        {
          error: error.message,
          status: error.status,
        },
        error.status
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.message,
        },
        400
      );
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return c.json(
        {
          error: 'Duplicate Resource',
          message: 'A resource with this information already exists',
        },
        409
      );
    }

    if (error instanceof Error && error.message.includes('foreign key')) {
      return c.json(
        {
          error: 'Invalid Reference',
          message: 'Referenced resource does not exist',
        },
        400
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      return c.json(
        {
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'An unexpected error occurred',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        500
      );
    }

    // Handle unknown errors
    return c.json(
      {
        error: 'Unknown Error',
        message: 'An unexpected error occurred',
      },
      500
    );
  }
}

// Middleware to log requests
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Only log in development or if status >= 400
  if (process.env.NODE_ENV === 'development' || status >= 400) {
    console.log(`${method} ${url} - ${status} (${duration}ms)`);
  }
}

// Security headers middleware
export async function securityHeaders(c: Context, next: Next) {
  await next();
  
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only add HSTS in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}