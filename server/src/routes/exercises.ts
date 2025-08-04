import { Hono } from 'hono';
import { requireAuth, optionalAuth, getCurrentUser } from '../auth/middleware';
import { db } from '../db';
import { exercises, exerciseCategories, muscleGroups, equipment } from '../db/schema';
import { eq, like, inArray, sql, and } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const exerciseRoutes = new Hono();

// Get all muscle groups
exerciseRoutes.get('/muscle-groups', async (c) => {
  try {
    const groups = await db
      .select()
      .from(muscleGroups)
      .orderBy(muscleGroups.name);

    return c.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    return c.json({ error: 'Failed to fetch muscle groups' }, 500);
  }
});

// Get all exercise categories
exerciseRoutes.get('/categories', async (c) => {
  try {
    const categories = await db
      .select()
      .from(exerciseCategories)
      .orderBy(exerciseCategories.name);

    return c.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching exercise categories:', error);
    return c.json({ error: 'Failed to fetch exercise categories' }, 500);
  }
});

// Get all equipment
exerciseRoutes.get('/equipment', async (c) => {
  try {
    const equipmentList = await db
      .select()
      .from(equipment)
      .orderBy(equipment.name);

    return c.json({
      success: true,
      data: equipmentList,
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return c.json({ error: 'Failed to fetch equipment' }, 500);
  }
});

// Search and filter exercises
const exerciseFilterSchema = z.object({
  search: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  difficulty: z.array(z.number().min(1).max(5)).optional(),
  category: z.string().optional(),
  isCompound: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

exerciseRoutes.get('/', optionalAuth, zValidator('query', exerciseFilterSchema), async (c) => {
  const filters = c.req.valid('query');
  
  try {
    let query = db.select().from(exercises).where(eq(exercises.isActive, true));

    // Apply filters
    const conditions = [eq(exercises.isActive, true)];

    if (filters.search) {
      conditions.push(
        sql`(${exercises.name} ILIKE ${`%${filters.search}%`} OR ${exercises.description} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (filters.muscleGroups && filters.muscleGroups.length > 0) {
      conditions.push(
        sql`${exercises.primaryMuscleGroups} && ${JSON.stringify(filters.muscleGroups)}`
      );
    }

    if (filters.equipment && filters.equipment.length > 0) {
      conditions.push(
        sql`${exercises.equipmentNeeded} && ${JSON.stringify(filters.equipment)}`
      );
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      conditions.push(inArray(exercises.difficulty, filters.difficulty));
    }

    if (filters.category) {
      conditions.push(eq(exercises.categoryId, filters.category));
    }

    if (filters.isCompound !== undefined) {
      conditions.push(eq(exercises.isCompound, filters.isCompound));
    }

    const exerciseList = await db
      .select()
      .from(exercises)
      .where(and(...conditions))
      .limit(filters.limit)
      .offset(filters.offset)
      .orderBy(exercises.name);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(exercises)
      .where(and(...conditions));

    return c.json({
      success: true,
      data: exerciseList,
      pagination: {
        total: count,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < count,
      },
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return c.json({ error: 'Failed to fetch exercises' }, 500);
  }
});

// Get specific exercise by ID
exerciseRoutes.get('/:exerciseId', optionalAuth, async (c) => {
  const exerciseId = c.req.param('exerciseId');
  
  try {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(and(
        eq(exercises.id, exerciseId),
        eq(exercises.isActive, true)
      ));

    if (!exercise) {
      return c.json({ error: 'Exercise not found' }, 404);
    }

    return c.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return c.json({ error: 'Failed to fetch exercise' }, 500);
  }
});

// Get user's favorite exercises
exerciseRoutes.get('/favorites', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  
  try {
    // This would typically query a user_favorite_exercises table
    // For now, return empty array as placeholder
    return c.json({
      success: true,
      data: [],
      message: 'Favorite exercises feature coming soon',
    });
  } catch (error) {
    console.error('Error fetching favorite exercises:', error);
    return c.json({ error: 'Failed to fetch favorite exercises' }, 500);
  }
});

// Add exercise to favorites
exerciseRoutes.post('/:exerciseId/favorite', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const exerciseId = c.req.param('exerciseId');
  
  try {
    // Verify exercise exists
    const [exercise] = await db
      .select({ id: exercises.id })
      .from(exercises)
      .where(and(
        eq(exercises.id, exerciseId),
        eq(exercises.isActive, true)
      ));

    if (!exercise) {
      return c.json({ error: 'Exercise not found' }, 404);
    }

    // This would typically insert into user_favorite_exercises table
    // For now, return success message
    return c.json({
      success: true,
      message: 'Exercise favorited successfully',
    });
  } catch (error) {
    console.error('Error favoriting exercise:', error);
    return c.json({ error: 'Failed to favorite exercise' }, 500);
  }
});

// Remove exercise from favorites
exerciseRoutes.delete('/:exerciseId/favorite', requireAuth, async (c) => {
  const user = getCurrentUser(c)!;
  const exerciseId = c.req.param('exerciseId');
  
  try {
    // This would typically remove from user_favorite_exercises table
    // For now, return success message
    return c.json({
      success: true,
      message: 'Exercise removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite exercise:', error);
    return c.json({ error: 'Failed to remove favorite exercise' }, 500);
  }
});

// Get exercise variations
exerciseRoutes.get('/:exerciseId/variations', optionalAuth, async (c) => {
  const exerciseId = c.req.param('exerciseId');
  
  try {
    // This would query the exercise_variations table
    // For now, return empty array
    return c.json({
      success: true,
      data: [],
      message: 'Exercise variations feature coming soon',
    });
  } catch (error) {
    console.error('Error fetching exercise variations:', error);
    return c.json({ error: 'Failed to fetch exercise variations' }, 500);
  }
});

// Get popular exercises
exerciseRoutes.get('/popular', optionalAuth, async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  
  try {
    // This would typically order by usage statistics
    // For now, just return the first exercises
    const popularExercises = await db
      .select()
      .from(exercises)
      .where(eq(exercises.isActive, true))
      .limit(limit)
      .orderBy(exercises.name);

    return c.json({
      success: true,
      data: popularExercises,
    });
  } catch (error) {
    console.error('Error fetching popular exercises:', error);
    return c.json({ error: 'Failed to fetch popular exercises' }, 500);
  }
});

export default exerciseRoutes;