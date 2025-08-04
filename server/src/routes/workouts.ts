import { Hono } from 'hono';
import { requireAuth, getCurrentUser } from '../auth/middleware';
import { db } from '../db';
import { workoutPlans, workoutSessions, exerciseLogs } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { WorkoutPlanGenerator } from '../services/workout-generator';

const workoutRoutes = new Hono();

// Get user's workout plans
workoutRoutes.get('/plans', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  
  try {
    const plans = await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.userId, user.id))
      .orderBy(desc(workoutPlans.createdAt));

    return c.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return c.json({ error: 'Failed to fetch workout plans' }, 500);
  }
});

// Get specific workout plan
workoutRoutes.get('/plans/:planId', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const planId = c.req.param('planId');
  
  try {
    const [plan] = await db
      .select()
      .from(workoutPlans)
      .where(and(
        eq(workoutPlans.id, planId),
        eq(workoutPlans.userId, user.id)
      ));

    if (!plan) {
      return c.json({ error: 'Workout plan not found' }, 404);
    }

    return c.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return c.json({ error: 'Failed to fetch workout plan' }, 500);
  }
});

// Generate new workout plan
const generatePlanSchema = z.object({
  fitnessGoals: z.array(z.string()).min(1),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  availableEquipment: z.array(z.string()).min(1),
  workoutsPerWeek: z.number().min(2).max(6),
  timePerWorkout: z.number().min(30).max(120),
});

workoutRoutes.post('/plans/generate', requireAuth, zValidator('json', generatePlanSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const request = c.req.valid('json');
  
  try {
    const generator = new WorkoutPlanGenerator();
    const plan = await generator.generatePlan({
      ...request,
      userId: user.id,
    });

    return c.json({
      success: true,
      data: plan,
      message: 'Workout plan generated successfully',
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return c.json({ error: 'Failed to generate workout plan' }, 500);
  }
});

// Start a workout plan
workoutRoutes.post('/plans/:planId/start', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const planId = c.req.param('planId');
  
  try {
    // Deactivate any currently active plans
    await db
      .update(workoutPlans)
      .set({ isActive: false })
      .where(eq(workoutPlans.userId, user.id));

    // Activate the selected plan
    const [updatedPlan] = await db
      .update(workoutPlans)
      .set({ 
        isActive: true,
        startedAt: new Date(),
      })
      .where(and(
        eq(workoutPlans.id, planId),
        eq(workoutPlans.userId, user.id)
      ))
      .returning();

    if (!updatedPlan) {
      return c.json({ error: 'Workout plan not found' }, 404);
    }

    return c.json({
      success: true,
      data: updatedPlan,
      message: 'Workout plan started successfully',
    });
  } catch (error) {
    console.error('Error starting workout plan:', error);
    return c.json({ error: 'Failed to start workout plan' }, 500);
  }
});

// Get workout sessions
workoutRoutes.get('/sessions', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, user.id))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    return c.json({ error: 'Failed to fetch workout sessions' }, 500);
  }
});

// Start workout session
const startSessionSchema = z.object({
  planId: z.string().uuid().optional(),
  workoutName: z.string().min(1),
  weekNumber: z.number().optional(),
  dayNumber: z.number().optional(),
  scheduledDate: z.string().datetime().optional(),
});

workoutRoutes.post('/sessions', requireAuth, zValidator('json', startSessionSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const sessionData = c.req.valid('json');
  
  try {
    const [session] = await db
      .insert(workoutSessions)
      .values({
        userId: user.id,
        planId: sessionData.planId,
        workoutName: sessionData.workoutName,
        weekNumber: sessionData.weekNumber,
        dayNumber: sessionData.dayNumber,
        scheduledDate: sessionData.scheduledDate ? new Date(sessionData.scheduledDate) : undefined,
        startedAt: new Date(),
      })
      .returning();

    return c.json({
      success: true,
      data: session,
      message: 'Workout session started',
    });
  } catch (error) {
    console.error('Error starting workout session:', error);
    return c.json({ error: 'Failed to start workout session' }, 500);
  }
});

// Complete workout session
const completeSessionSchema = z.object({
  perceivedExertion: z.number().min(1).max(10).optional(),
  overallRating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

workoutRoutes.put('/sessions/:sessionId/complete', requireAuth, zValidator('json', completeSessionSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const sessionId = c.req.param('sessionId');
  const completionData = c.req.valid('json');
  
  try {
    // Calculate session statistics
    const sessionLogs = await db
      .select()
      .from(exerciseLogs)
      .where(eq(exerciseLogs.sessionId, sessionId));

    const totalSets = sessionLogs.length;
    const totalReps = sessionLogs.reduce((sum, log) => sum + log.repsCompleted, 0);
    const totalVolume = sessionLogs.reduce((sum, log) => 
      sum + (parseFloat(log.weightUsed?.toString() || '0') * log.repsCompleted), 0
    );

    const [updatedSession] = await db
      .update(workoutSessions)
      .set({
        completedAt: new Date(),
        totalSets,
        totalReps,
        totalVolume: totalVolume.toString(),
        perceivedExertion: completionData.perceivedExertion,
        overallRating: completionData.overallRating,
        notes: completionData.notes,
      })
      .where(and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, user.id)
      ))
      .returning();

    if (!updatedSession) {
      return c.json({ error: 'Workout session not found' }, 404);
    }

    return c.json({
      success: true,
      data: updatedSession,
      message: 'Workout session completed',
    });
  } catch (error) {
    console.error('Error completing workout session:', error);
    return c.json({ error: 'Failed to complete workout session' }, 500);
  }
});

// Log exercise set
const logExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  setNumber: z.number().min(1),
  repsCompleted: z.number().min(0),
  weightUsed: z.number().min(0).optional(),
  restTimeSeconds: z.number().min(0).optional(),
  perceivedExertion: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  isWarmupSet: z.boolean().optional(),
  isDropSet: z.boolean().optional(),
});

workoutRoutes.post('/sessions/:sessionId/logs', requireAuth, zValidator('json', logExerciseSchema), async (c) => {
  const user = getCurrentUser(c)!;
  const sessionId = c.req.param('sessionId');
  const logData = c.req.valid('json');
  
  try {
    // Verify session belongs to user
    const [session] = await db
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, user.id)
      ));

    if (!session) {
      return c.json({ error: 'Workout session not found' }, 404);
    }

    const [exerciseLog] = await db
      .insert(exerciseLogs)
      .values({
        sessionId,
        exerciseId: logData.exerciseId,
        setNumber: logData.setNumber,
        repsCompleted: logData.repsCompleted,
        weightUsed: logData.weightUsed?.toString(),
        restTimeSeconds: logData.restTimeSeconds,
        perceivedExertion: logData.perceivedExertion,
        notes: logData.notes,
        isWarmupSet: logData.isWarmupSet || false,
        isDropSet: logData.isDropSet || false,
      })
      .returning();

    return c.json({
      success: true,
      data: exerciseLog,
      message: 'Exercise set logged successfully',
    });
  } catch (error) {
    console.error('Error logging exercise set:', error);
    return c.json({ error: 'Failed to log exercise set' }, 500);
  }
});

// Get exercise logs for a session
workoutRoutes.get('/sessions/:sessionId/logs', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const sessionId = c.req.param('sessionId');
  
  try {
    // Verify session belongs to user
    const [session] = await db
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, user.id)
      ));

    if (!session) {
      return c.json({ error: 'Workout session not found' }, 404);
    }

    const logs = await db
      .select()
      .from(exerciseLogs)
      .where(eq(exerciseLogs.sessionId, sessionId))
      .orderBy(exerciseLogs.completedAt);

    return c.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching exercise logs:', error);
    return c.json({ error: 'Failed to fetch exercise logs' }, 500);
  }
});

export default workoutRoutes;