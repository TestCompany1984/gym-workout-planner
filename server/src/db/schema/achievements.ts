import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

export const achievementDefinitions = pgTable('achievement_definitions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 255 }),
  
  category: varchar('category', { length: 20 }).notNull().$type<'strength' | 'endurance' | 'consistency' | 'milestone'>(),
  rarity: varchar('rarity', { length: 15 }).notNull().$type<'common' | 'rare' | 'epic' | 'legendary'>(),
  
  // Achievement requirements (JSON array)
  requirements: jsonb('requirements').notNull().$type<{
    type: 'workout_count' | 'streak' | 'weight_lifted' | 'exercise_mastery' | 'plan_completion';
    value: number;
    description: string;
    exerciseId?: string; // For exercise-specific achievements
  }[]>(),
  
  // Points/rewards for earning this achievement
  points: integer('points').default(0),
  
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid('achievement_id').references(() => achievementDefinitions.id).notNull(),
  
  // Progress tracking
  currentProgress: integer('current_progress').default(0),
  targetProgress: integer('target_progress').notNull(),
  progressPercentage: integer('progress_percentage').default(0),
  
  isCompleted: boolean('is_completed').default(false),
  earnedAt: timestamp('earned_at'),
  
  // Context data for the achievement
  contextData: jsonb('context_data').$type<Record<string, any>>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Workout statistics
  totalWorkouts: integer('total_workouts').default(0),
  totalSets: integer('total_sets').default(0),
  totalReps: integer('total_reps').default(0),
  totalVolume: integer('total_volume').default(0), // kg
  totalTimeMinutes: integer('total_time_minutes').default(0),
  
  // Streak tracking
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastWorkoutDate: timestamp('last_workout_date'),
  
  // Plan completion
  plansCompleted: integer('plans_completed').default(0),
  currentPlanProgress: integer('current_plan_progress').default(0),
  
  // Achievement points
  totalAchievementPoints: integer('total_achievement_points').default(0),
  
  // Level system
  userLevel: integer('user_level').default(1),
  experiencePoints: integer('experience_points').default(0),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas
export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions);
export const selectAchievementDefinitionSchema = createSelectSchema(achievementDefinitions);

export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const selectUserAchievementSchema = createSelectSchema(userAchievements);

export const insertUserStatsSchema = createInsertSchema(userStats);
export const selectUserStatsSchema = createSelectSchema(userStats);

// Types
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type NewAchievementDefinition = typeof achievementDefinitions.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;

export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;