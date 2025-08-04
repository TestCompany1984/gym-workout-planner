import { Context, Next } from 'hono';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('origin');
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    c.header('Access-Control-Allow-Origin', '*');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}