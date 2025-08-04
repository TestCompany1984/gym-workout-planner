import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const muscleGroups = pgTable('muscle_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  category: varchar('category', { length: 20 }).notNull().$type<'primary' | 'secondary'>(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exerciseCategories = pgTable('exercise_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description').notNull(),
  
  // Instructions stored as JSON array
  instructions: jsonb('instructions').notNull().$type<string[]>(),
  
  // Muscle groups (JSON array of IDs)
  primaryMuscleGroups: jsonb('primary_muscle_groups').notNull().$type<string[]>(),
  secondaryMuscleGroups: jsonb('secondary_muscle_groups').default([]).$type<string[]>(),
  
  // Equipment needed (JSON array of IDs)
  equipmentNeeded: jsonb('equipment_needed').notNull().$type<string[]>(),
  
  difficulty: integer('difficulty').notNull().default(1), // 1-5 scale
  isCompound: boolean('is_compound').default(false),
  
  categoryId: uuid('category_id').references(() => exerciseCategories.id),
  
  // Media URLs
  videoUrl: varchar('video_url', { length: 255 }),
  imageUrl: varchar('image_url', { length: 255 }),
  
  // Tips and safety
  commonMistakes: jsonb('common_mistakes').default([]).$type<string[]>(),
  tips: jsonb('tips').default([]).$type<string[]>(),
  
  // Metadata
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const exerciseVariations = pgTable('exercise_variations', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentExerciseId: uuid('parent_exercise_id').references(() => exercises.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description').notNull(),
  difficulty: integer('difficulty').notNull(),
  equipmentNeeded: jsonb('equipment_needed').notNull().$type<string[]>(),
  instructions: jsonb('instructions').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas
export const insertMuscleGroupSchema = createInsertSchema(muscleGroups);
export const selectMuscleGroupSchema = createSelectSchema(muscleGroups);

export const insertExerciseCategorySchema = createInsertSchema(exerciseCategories);
export const selectExerciseCategorySchema = createSelectSchema(exerciseCategories);

export const insertExerciseSchema = createInsertSchema(exercises);
export const selectExerciseSchema = createSelectSchema(exercises);

export const insertExerciseVariationSchema = createInsertSchema(exerciseVariations);
export const selectExerciseVariationSchema = createSelectSchema(exerciseVariations);

// Types
export type MuscleGroup = typeof muscleGroups.$inferSelect;
export type NewMuscleGroup = typeof muscleGroups.$inferInsert;

export type ExerciseCategory = typeof exerciseCategories.$inferSelect;
export type NewExerciseCategory = typeof exerciseCategories.$inferInsert;

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type ExerciseVariation = typeof exerciseVariations.$inferSelect;
export type NewExerciseVariation = typeof exerciseVariations.$inferInsert;