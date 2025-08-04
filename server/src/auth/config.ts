import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { users, userProfiles, userStats } from '../db/schema';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required');
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  plugins: [],
  hooks: {
    after: [
      {
        matcher(context) {
          return context.path === '/sign-up';
        },
        async handler(ctx) {
          // Create user profile and stats after successful signup
          if (ctx.user) {
            try {
              // Create default user profile
              await db.insert(userProfiles).values({
                userId: ctx.user.id,
                experienceLevel: 'beginner',
                fitnessGoals: [],
                availableEquipment: [],
                preferredWorkoutDays: 3,
                timePerWorkout: 60,
              });

              // Create user stats
              await db.insert(userStats).values({
                userId: ctx.user.id,
              });
            } catch (error) {
              console.error('Error creating user profile and stats:', error);
            }
          }
        },
      },
    ],
  },
});