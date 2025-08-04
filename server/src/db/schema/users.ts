import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  experienceLevel: varchar('experience_level', { length: 20 }).notNull().$type<'beginner' | 'intermediate' | 'advanced'>(),
  
  // Fitness goals stored as JSON array
  fitnessGoals: jsonb('fitness_goals').notNull().$type<string[]>(), // goal IDs
  
  // Equipment stored as JSON array  
  availableEquipment: jsonb('available_equipment').notNull().$type<string[]>(), // equipment IDs
  
  preferredWorkoutDays: integer('preferred_workout_days').notNull().default(3),
  timePerWorkout: integer('time_per_workout').notNull().default(60), // minutes
  
  // Physical stats
  currentWeight: decimal('current_weight', { precision: 5, scale: 2 }), // kg
  targetWeight: decimal('target_weight', { precision: 5, scale: 2 }), // kg
  height: integer('height'), // cm
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const fitnessGoals = pgTable('fitness_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 30 }).notNull().$type<'build_muscle' | 'lose_weight' | 'get_stronger' | 'improve_endurance' | 'general_fitness' | 'specific_sport'>(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const equipment = pgTable('equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 20 }).notNull().$type<'weights' | 'cardio' | 'bodyweight' | 'accessories'>(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);

export const insertFitnessGoalSchema = createInsertSchema(fitnessGoals);
export const selectFitnessGoalSchema = createSelectSchema(fitnessGoals);

export const insertEquipmentSchema = createInsertSchema(equipment);
export const selectEquipmentSchema = createSelectSchema(equipment);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type FitnessGoal = typeof fitnessGoals.$inferSelect;
export type NewFitnessGoal = typeof fitnessGoals.$inferInsert;

export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;