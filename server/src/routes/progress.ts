import { Hono } from 'hono';
import { requireAuth, getCurrentUser } from '../auth/middleware';
import { db } from '../db';
import { 
  userProgress, 
  personalRecords, 
  workoutSessions, 
  exerciseLogs,
  userStats,
  exercises
} from '../db/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const progressRoutes = new Hono();

// Get user progress metrics
progressRoutes.get('/metrics', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const timeRange = c.req.query('range') || '1m'; // 1w, 1m, 3m, 6m, 1y
  
  try {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get workout statistics
    const workoutStats = await db
      .select({
        totalWorkouts: sql<number>`count(*)`,
        totalDuration: sql<number>`sum(COALESCE(${workoutSessions.durationMinutes}, 0))`,
        avgDuration: sql<number>`avg(COALESCE(${workoutSessions.durationMinutes}, 0))`,
        totalVolume: sql<number>`sum(COALESCE(${workoutSessions.totalVolume}, 0))`,
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, user.id),
          gte(workoutSessions.startedAt, startDate),
          lte(workoutSessions.startedAt, now)
        )
      );

    // Get personal records
    const recentPRs = await db
      .select({
        id: personalRecords.id,
        exerciseId: personalRecords.exerciseId,
        recordType: personalRecords.recordType,
        value: personalRecords.value,
        reps: personalRecords.reps,
        achievedAt: personalRecords.achievedAt,
        exerciseName: exercises.name,
      })
      .from(personalRecords)
      .leftJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
      .where(
        and(
          eq(personalRecords.userId, user.id),
          gte(personalRecords.achievedAt, startDate)
        )
      )
      .orderBy(desc(personalRecords.achievedAt))
      .limit(10);

    // Get body weight progress
    const bodyWeightProgress = await db
      .select({
        date: userProgress.recordDate,
        weight: userProgress.bodyWeight,
      })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, user.id),
          gte(userProgress.recordDate, startDate),
          sql`${userProgress.bodyWeight} IS NOT NULL`
        )
      )
      .orderBy(userProgress.recordDate);

    // Calculate current streak
    const streakData = await calculateCurrentStreak(user.id);

    return c.json({
      success: true,
      data: {
        timeRange,
        workoutStats: workoutStats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          avgDuration: 0,
          totalVolume: 0,
        },
        personalRecords: recentPRs,
        bodyWeightProgress,
        streak: streakData,
      },
    });
  } catch (error) {
    console.error('Error fetching progress metrics:', error);
    return c.json({ error: 'Failed to fetch progress metrics' }, 500);
  }
});

// Get strength progress for specific exercise
progressRoutes.get('/strength/:exerciseId', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const exerciseId = c.req.param('exerciseId');
  const timeRange = c.req.query('range') || '3m';
  
  try {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 3);
    }

    // Get max weight progression
    const strengthProgress = await db
      .select({
        date: sql<string>`DATE(${exerciseLogs.completedAt})`,
        maxWeight: sql<number>`MAX(CAST(${exerciseLogs.weightUsed} AS DECIMAL))`,
        totalVolume: sql<number>`SUM(CAST(${exerciseLogs.weightUsed} AS DECIMAL) * ${exerciseLogs.repsCompleted})`,
        totalReps: sql<number>`SUM(${exerciseLogs.repsCompleted})`,
      })
      .from(exerciseLogs)
      .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
      .where(
        and(
          eq(workoutSessions.userId, user.id),
          eq(exerciseLogs.exerciseId, exerciseId),
          gte(exerciseLogs.completedAt, startDate),
          sql`${exerciseLogs.weightUsed} IS NOT NULL`
        )
      )
      .groupBy(sql`DATE(${exerciseLogs.completedAt})`)
      .orderBy(sql`DATE(${exerciseLogs.completedAt})`);

    // Get current personal records for this exercise
    const currentPRs = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.userId, user.id),
          eq(personalRecords.exerciseId, exerciseId)
        )
      )
      .orderBy(desc(personalRecords.achievedAt));

    return c.json({
      success: true,
      data: {
        exerciseId,
        timeRange,
        strengthProgress,
        personalRecords: currentPRs,
      },
    });
  } catch (error) {
    console.error('Error fetching strength progress:', error);
    return c.json({ error: 'Failed to fetch strength progress' }, 500);
  }
});

// Log body progress
const bodyProgressSchema = z.object({
  bodyWeight: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  bodyMeasurements: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
  mood: z.number().min(1).max(5).optional(),
  energy: z.number().min(1).max(5).optional(),
});

progressRoutes.post('/body', requireAuth, zValidator('json', bodyProgressSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const progressData = c.req.valid('json');
  
  try {
    const [newProgress] = await db
      .insert(userProgress)
      .values({
        userId: user.id,
        bodyWeight: progressData.bodyWeight?.toString(),
        bodyFatPercentage: progressData.bodyFatPercentage?.toString(),
        bodyMeasurements: progressData.bodyMeasurements || {},
        notes: progressData.notes,
        mood: progressData.mood,
        energy: progressData.energy,
      })
      .returning();

    return c.json({
      success: true,
      data: newProgress,
      message: 'Body progress logged successfully',
    });
  } catch (error) {
    console.error('Error logging body progress:', error);
    return c.json({ error: 'Failed to log body progress' }, 500);
  }
});

// Get body progress history
progressRoutes.get('/body', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const limit = parseInt(c.req.query('limit') || '30');
  
  try {
    const bodyProgress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, user.id))
      .orderBy(desc(userProgress.recordDate))
      .limit(limit);

    return c.json({
      success: true,
      data: bodyProgress,
    });
  } catch (error) {
    console.error('Error fetching body progress:', error);
    return c.json({ error: 'Failed to fetch body progress' }, 500);
  }
});

// Get workout volume chart data
progressRoutes.get('/charts/volume', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const timeRange = c.req.query('range') || '1m';
  
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const volumeData = await db
      .select({
        date: sql<string>`DATE(${workoutSessions.startedAt})`,
        volume: sql<number>`SUM(COALESCE(CAST(${workoutSessions.totalVolume} AS DECIMAL), 0))`,
        workouts: sql<number>`COUNT(*)`,
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, user.id),
          gte(workoutSessions.startedAt, startDate),
          sql`${workoutSessions.completedAt} IS NOT NULL`
        )
      )
      .groupBy(sql`DATE(${workoutSessions.startedAt})`)
      .orderBy(sql`DATE(${workoutSessions.startedAt})`);

    return c.json({
      success: true,
      data: {
        timeRange,
        chartData: volumeData,
      },
    });
  } catch (error) {
    console.error('Error fetching volume chart data:', error);
    return c.json({ error: 'Failed to fetch volume chart data' }, 500);
  }
});

// Helper function to calculate current streak
async function calculateCurrentStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}> {
  try {
    // Get all workout dates for the user
    const workoutDates = await db
      .select({
        date: sql<string>`DATE(${workoutSessions.startedAt})`,
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.completedAt} IS NOT NULL`
        )
      )
      .groupBy(sql`DATE(${workoutSessions.startedAt})`)
      .orderBy(desc(sql`DATE(${workoutSessions.startedAt})`));

    if (workoutDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
    }

    const dates = workoutDates.map(w => new Date(w.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    for (let i = 0; i < dates.length; i++) {
      const workoutDate = new Date(dates[i]);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(dates[i - 1]);
        const daysBetween = Math.floor((prevDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween <= 2) { // Allow 1 rest day
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(dates[i]);
        const prevDate = new Date(dates[i - 1]);
        const daysBetween = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween <= 2) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate: dates[0]?.toISOString().split('T')[0] || null,
    };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
  }
}

export default progressRoutes;