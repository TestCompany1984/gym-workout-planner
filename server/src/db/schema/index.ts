// Export all schema definitions and types
export * from './users';
export * from './exercises';
export * from './workouts';
export * from './achievements';

// Combined exports for convenience
import { users, userProfiles, fitnessGoals, equipment } from './users';
import { muscleGroups, exerciseCategories, exercises, exerciseVariations } from './exercises';
import { workoutPlans, workoutSessions, exerciseLogs, personalRecords, userProgress } from './workouts';
import { achievementDefinitions, userAchievements, userStats } from './achievements';

export const schema = {
  // User-related tables
  users,
  userProfiles,
  fitnessGoals,
  equipment,
  
  // Exercise-related tables
  muscleGroups,
  exerciseCategories,
  exercises,
  exerciseVariations,
  
  // Workout-related tables
  workoutPlans,
  workoutSessions,
  exerciseLogs,
  personalRecords,
  userProgress,
  
  // Achievement-related tables
  achievementDefinitions,
  userAchievements,
  userStats,
};