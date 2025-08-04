// Core data types for the gym workout tracker app

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals: FitnessGoal[];
  availableEquipment: Equipment[];
  preferredWorkoutDays: number; // days per week
  timePerWorkout: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessGoal {
  id: string;
  type: 'build_muscle' | 'lose_weight' | 'get_stronger' | 'improve_endurance' | 'general_fitness' | 'specific_sport';
  name: string;
  description: string;
  targetDate?: Date;
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'weights' | 'cardio' | 'bodyweight' | 'accessories';
  isAvailable: boolean;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // weeks
  workoutsPerWeek: number;
  weeks: WorkoutWeek[];
  templateType: 'strength' | 'hypertrophy' | 'endurance';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  isActive: boolean;
}

export interface WorkoutWeek {
  id: string;
  weekNumber: number;
  theme: string;
  workouts: Workout[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  exercises: WorkoutExercise[];
  restPeriods: RestPeriod[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  muscleGroups: MuscleGroup[];
  equipmentNeeded: Equipment[];
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number | string; // can be "8-12" for ranges
  weight?: number;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  videoUrl?: string;
  imageUrl?: string;
  commonMistakes: string[];
  tips: string[];
  variations: ExerciseVariation[];
  category: ExerciseCategory;
}

export interface ExerciseVariation {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  equipment: Equipment[];
}

export interface MuscleGroup {
  id: string;
  name: string;
  category: 'primary' | 'secondary';
}

export interface RestPeriod {
  id: string;
  afterExerciseId: string;
  duration: number; // seconds
  type: 'active' | 'passive';
}

export interface ActiveWorkout {
  id: string;
  workoutId: string;
  workout: Workout;
  userId: string;
  startedAt: Date;
  currentExerciseIndex: number;
  currentSet: number;
  exerciseLogs: ExerciseLog[];
  totalDuration?: number;
  completedAt?: Date;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  activeWorkoutId: string;
  exerciseId: string;
  setNumber: number;
  weight?: number;
  reps: number;
  duration?: number; // for time-based exercises
  restDuration?: number;
  completedAt: Date;
  notes?: string;
  perceivedExertion?: number; // 1-10 scale
}

export interface WorkoutHistory {
  id: string;
  userId: string;
  workoutId: string;
  workout: Workout;
  completedAt: Date;
  duration: number;
  exerciseLogs: ExerciseLog[];
  overallRating?: number; // 1-5 scale
  notes?: string;
}

export interface ProgressMetrics {
  userId: string;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number; // sets × reps × weight
  strengthProgress: StrengthProgress[];
  bodyMetrics: BodyMetric[];
  goals: GoalProgress[];
  lastUpdated: Date;
}

export interface StrengthProgress {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  oneRepMax?: number;
  volumePR: number;
  lastImprovement: Date;
  progressTrend: 'improving' | 'maintaining' | 'declining';
}

export interface BodyMetric {
  id: string;
  userId: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'measurement';
  value: number;
  unit: string;
  bodyPart?: string; // for measurements
  recordedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  goal: FitnessGoal;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercentage: number;
  isCompleted: boolean;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  value: number;
  achievedAt?: Date;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'strength' | 'endurance' | 'consistency' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
  progress?: number; // 0-100 percentage
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'workout_count' | 'streak' | 'weight_lifted' | 'exercise_mastery';
  value: number;
  description: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
}

// UI State Types
export interface WorkoutTimerState {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
  type: 'rest' | 'exercise';
  canSkip: boolean;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter and Search Types
export interface ExerciseFilters {
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: number[];
  category?: string;
  searchTerm?: string;
}

export interface WorkoutFilters {
  duration?: [number, number]; // min, max minutes
  difficulty?: number[];
  muscleGroups?: string[];
  equipment?: string[];
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressChartData {
  title: string;
  data: ChartDataPoint[];
  metric: string;
  timeRange: '1w' | '1m' | '3m' | '6m' | '1y';
  trend: 'up' | 'down' | 'stable';
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface VariantProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface LoadingProps {
  loading?: boolean;
  disabled?: boolean;
}