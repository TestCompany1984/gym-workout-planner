import { Hono } from 'hono';
import { auth } from '../auth/config';
import { requireAuth, getCurrentUser } from '../auth/middleware';
import { db } from '../db';
import { userProfiles, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const authRoutes = new Hono();

// Handle BetterAuth routes
authRoutes.all('/api/auth/*', async (c) => {
  return auth.handler(c.req.raw);
});

// Get current user profile
authRoutes.get('/profile', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  
  try {
    // Get user with profile
    const [userWithProfile] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        profile: {
          id: userProfiles.id,
          experienceLevel: userProfiles.experienceLevel,
          fitnessGoals: userProfiles.fitnessGoals,
          availableEquipment: userProfiles.availableEquipment,
          preferredWorkoutDays: userProfiles.preferredWorkoutDays,
          timePerWorkout: userProfiles.timePerWorkout,
          currentWeight: userProfiles.currentWeight,
          targetWeight: userProfiles.targetWeight,
          height: userProfiles.height,
        },
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, user.id));

    if (!userWithProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      data: userWithProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
const updateProfileSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  fitnessGoals: z.array(z.string()).optional(),
  availableEquipment: z.array(z.string()).optional(),
  preferredWorkoutDays: z.number().min(1).max(7).optional(),
  timePerWorkout: z.number().min(15).max(180).optional(),
  currentWeight: z.number().positive().optional(),
  targetWeight: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

authRoutes.put('/profile', requireAuth, zValidator('json', updateProfileSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const updates = c.req.valid('json');
  
  try {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, user.id))
      .returning();

    if (!updatedProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Update user account details
const updateAccountSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

authRoutes.put('/account', requireAuth, zValidator('json', updateAccountSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const updates = c.req.valid('json');
  
  try {
    // Check if email is already taken (if changing email)
    if (updates.email && updates.email !== user.email) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (existingUser.length > 0) {
        return c.json({ error: 'Email already in use' }, 400);
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return c.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerified: updatedUser.emailVerified,
      },
      message: 'Account updated successfully',
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return c.json({ error: 'Failed to update account' }, 500);
  }
});

// Get user stats
authRoutes.get('/stats', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  
  try {
    // This would typically aggregate data from workout sessions
    // For now, return mock data structure
    const stats = {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalVolume: 0,
      averageSessionDuration: 0,
      plansCompleted: 0,
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default authRoutes;