import { Context, Next } from 'hono';
import { auth } from './config';

// Type for authenticated context
export interface AuthContext extends Context {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

// Middleware to verify authentication
export async function requireAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.header(),
    });

    if (!session || !session.user) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        401
      );
    }

    // Add user and session to context
    c.set('user', session.user);
    c.set('session', session.session);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json(
      {
        error: 'Authentication Error',
        message: 'Failed to verify authentication',
      },
      401
    );
  }
}

// Optional auth middleware - doesn't require authentication but adds user if available
export async function optionalAuth(c: Context, next: Next) {
  try {
    const session = await auth.api.getSession({
      headers: c.req.header(),
    });

    if (session && session.user) {
      c.set('user', session.user);
      c.set('session', session.session);
    }

    await next();
  } catch (error) {
    // Continue without authentication
    console.warn('Optional auth failed:', error);
    await next();
  }
}

// Helper function to get current user from context
export function getCurrentUser(c: Context) {
  return c.get('user') as AuthContext['user'] | undefined;
}

// Helper function to get current session from context
export function getCurrentSession(c: Context) {
  return c.get('session') as AuthContext['session'] | undefined;
}