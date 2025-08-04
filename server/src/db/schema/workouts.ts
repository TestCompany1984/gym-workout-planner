import { pgTable, uuid, varchar, text, integer, timestamp, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';
import { exercises } from './exercises';

export const workoutPlans = pgTable('workout_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  
  duration: integer('duration').notNull().default(4), // weeks
  workoutsPerWeek: integer('workouts_per_week').notNull().default(3),
  templateType: varchar('template_type', { length: 20 }).notNull().$type<'strength' | 'hypertrophy' | 'endurance'>(),
  
  // Plan structure stored as JSON
  planStructure: jsonb('plan_structure').notNull().$type<{
    weeks: {
      weekNumber: number;
      theme: string;
      workouts: {
        day: number;
        name: string;
        exercises: {
          exerciseId: string;
          sets: number;
          reps: string; // Can be "8-12" for ranges
          weight?: number;
          restSeconds: number;
          notes?: string;
        }[];
      }[];
    }[];
  }>(),
  
  // Plan status
  isActive: boolean('is_active').default(false),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workoutSessions = pgTable('workout_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => workoutPlans.id, { onDelete: 'cascade' }),
  
  workoutName: varchar('workout_name', { length: 200 }).notNull(),
  weekNumber: integer('week_number'),
  dayNumber: integer('day_number'),
  
  // Session tracking
  scheduledDate: timestamp('scheduled_date'),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  durationMinutes: integer('duration_minutes'),
  
  // Session data
  totalSets: integer('total_sets').default(0),
  totalReps: integer('total_reps').default(0),
  totalVolume: decimal('total_volume', { precision: 10, scale: 2 }).default('0'), // kg
  
  // User feedback
  perceivedExertion: integer('perceived_exertion'), // 1-10 scale
  overallRating: integer('overall_rating'), // 1-5 scale
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exerciseLogs = pgTable('exercise_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => workoutSessions.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  
  // Set data
  setNumber: integer('set_number').notNull(),
  repsCompleted: integer('reps_completed').notNull(),
  weightUsed: decimal('weight_used', { precision: 6, scale: 2 }), // kg
  restTimeSeconds: integer('rest_time_seconds'),
  
  // Performance data
  perceivedExertion: integer('perceived_exertion'), // 1-10 scale
  tempo: varchar('tempo', { length: 10 }), // e.g., "3-1-2-1"
  
  // Metadata
  notes: text('notes'),
  isWarmupSet: boolean('is_warmup_set').default(false),
  isDropSet: boolean('is_drop_set').default(false),
  
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

export const personalRecords = pgTable('personal_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  exerciseId: uuid('exercise_id').references(() => exercises.id).notNull(),
  
  recordType: varchar('record_type', { length: 20 }).notNull().$type<'max_weight' | 'max_reps' | 'max_volume' | 'one_rep_max'>(),
  value: decimal('value', { precision: 8, scale: 2 }).notNull(),
  reps: integer('reps'), // For context on weight records
  
  // Reference to the log that set this record
  logId: uuid('log_id').references(() => exerciseLogs.id),
  
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userProgress = pgTable('user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  recordDate: timestamp('record_date').defaultNow().notNull(),
  
  // Body metrics
  bodyWeight: decimal('body_weight', { precision: 5, scale: 2 }), // kg
  bodyFatPercentage: decimal('body_fat_percentage', { precision: 4, scale: 2 }),
  
  // Body measurements (JSON object with measurement names as keys)
  bodyMeasurements: jsonb('body_measurements').$type<Record<string, number>>(), // cm
  
  // Calculated metrics
  totalVolume: decimal('total_volume', { precision: 10, scale: 2 }), // Weekly total
  totalWorkouts: integer('total_workouts'), // Weekly total
  averageSessionDuration: integer('average_session_duration'), // minutes
  
  // User notes
  notes: text('notes'),
  mood: integer('mood'), // 1-5 scale
  energy: integer('energy'), // 1-5 scale
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans);
export const selectWorkoutPlanSchema = createSelectSchema(workoutPlans);

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions);
export const selectWorkoutSessionSchema = createSelectSchema(workoutSessions);

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs);
export const selectExerciseLogSchema = createSelectSchema(exerciseLogs);

export const insertPersonalRecordSchema = createInsertSchema(personalRecords);
export const selectPersonalRecordSchema = createSelectSchema(personalRecords);

export const insertUserProgressSchema = createInsertSchema(userProgress);
export const selectUserProgressSchema = createSelectSchema(userProgress);

// Types
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type NewExerciseLog = typeof exerciseLogs.$inferInsert;

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type NewPersonalRecord = typeof personalRecords.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;