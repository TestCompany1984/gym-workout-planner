import type { 
  Exercise, 
  Equipment, 
  MuscleGroup, 
  WorkoutPlan, 
  Workout, 
  FitnessGoal,
  ExerciseCategory,
  Achievement 
} from '../types';

// Mock Equipment Data
export const mockEquipment: Equipment[] = [
  { id: 'eq-1', name: 'Barbell', category: 'weights', isAvailable: true },
  { id: 'eq-2', name: 'Dumbbells', category: 'weights', isAvailable: true },
  { id: 'eq-3', name: 'Pull-up Bar', category: 'bodyweight', isAvailable: true },
  { id: 'eq-4', name: 'Cable Machine', category: 'weights', isAvailable: true },
  { id: 'eq-5', name: 'Smith Machine', category: 'weights', isAvailable: false },
  { id: 'eq-6', name: 'Resistance Bands', category: 'accessories', isAvailable: true },
  { id: 'eq-7', name: 'Kettlebells', category: 'weights', isAvailable: true },
  { id: 'eq-8', name: 'Bench', category: 'accessories', isAvailable: true },
  { id: 'eq-9', name: 'Squat Rack', category: 'weights', isAvailable: true },
  { id: 'eq-10', name: 'Bodyweight Only', category: 'bodyweight', isAvailable: true },
];

// Mock Muscle Groups
export const mockMuscleGroups: MuscleGroup[] = [
  { id: 'mg-1', name: 'Chest', category: 'primary' },
  { id: 'mg-2', name: 'Back', category: 'primary' },
  { id: 'mg-3', name: 'Shoulders', category: 'primary' },
  { id: 'mg-4', name: 'Arms', category: 'primary' },
  { id: 'mg-5', name: 'Legs', category: 'primary' },
  { id: 'mg-6', name: 'Core', category: 'primary' },
  { id: 'mg-7', name: 'Triceps', category: 'secondary' },
  { id: 'mg-8', name: 'Biceps', category: 'secondary' },
  { id: 'mg-9', name: 'Forearms', category: 'secondary' },
  { id: 'mg-10', name: 'Calves', category: 'secondary' },
];

// Mock Exercise Categories
export const mockExerciseCategories: ExerciseCategory[] = [
  {
    id: 'cat-1',
    name: 'Compound Movements',
    description: 'Multi-joint exercises that work multiple muscle groups',
    muscleGroups: [mockMuscleGroups[0], mockMuscleGroups[1], mockMuscleGroups[4]],
  },
  {
    id: 'cat-2',
    name: 'Isolation Exercises',
    description: 'Single-joint exercises targeting specific muscles',
    muscleGroups: [mockMuscleGroups[6], mockMuscleGroups[7]],
  },
  {
    id: 'cat-3',
    name: 'Cardiovascular',
    description: 'Heart rate elevating exercises for endurance',
    muscleGroups: [mockMuscleGroups[4], mockMuscleGroups[5]],
  },
];

// Mock Exercises (50 exercises as specified)
export const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    description: 'Classic compound chest exercise',
    instructions: [
      'Lie flat on bench with feet planted on floor',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar up explosively',
      'Keep core tight throughout movement'
    ],
    muscleGroups: [mockMuscleGroups[0], mockMuscleGroups[6]],
    equipment: [mockEquipment[0], mockEquipment[7]],
    difficulty: 3,
    videoUrl: '/videos/bench-press.mp4',
    imageUrl: '/images/bench-press.jpg',
    commonMistakes: [
      'Bouncing bar off chest',
      'Lifting feet off ground',
      'Flaring elbows too wide'
    ],
    tips: [
      'Keep shoulder blades retracted',
      'Maintain arch in lower back',
      'Control the descent'
    ],
    variations: [
      {
        id: 'var-1',
        name: 'Incline Barbell Press',
        description: 'Upper chest focused variation',
        difficulty: 3,
        equipment: [mockEquipment[0], mockEquipment[7]],
      }
    ],
    category: mockExerciseCategories[0],
  },
  {
    id: 'ex-2',
    name: 'Deadlift',
    description: 'Full body compound pulling exercise',
    instructions: [
      'Stand with feet hip-width apart',
      'Grip barbell with hands just outside legs',
      'Keep back straight and chest up',
      'Drive through heels to lift',
      'Extend hips and knees simultaneously'
    ],
    muscleGroups: [mockMuscleGroups[1], mockMuscleGroups[4]],
    equipment: [mockEquipment[0]],
    difficulty: 4,
    videoUrl: '/videos/deadlift.mp4',
    imageUrl: '/images/deadlift.jpg',
    commonMistakes: [
      'Rounding lower back',
      'Bar drifting away from body',
      'Looking up during lift'
    ],
    tips: [
      'Keep bar close to shins',
      'Engage lats to maintain bar path',
      'Think about pushing floor away'
    ],
    variations: [
      {
        id: 'var-2',
        name: 'Sumo Deadlift',
        description: 'Wide stance variation',
        difficulty: 4,
        equipment: [mockEquipment[0]],
      }
    ],
    category: mockExerciseCategories[0],
  },
  {
    id: 'ex-3',
    name: 'Squat',
    description: 'Fundamental lower body exercise',
    instructions: [
      'Position bar on upper traps',
      'Stand with feet shoulder-width apart',
      'Initiate movement by sitting back',
      'Descend until thighs parallel to floor',
      'Drive through heels to stand'
    ],
    muscleGroups: [mockMuscleGroups[4], mockMuscleGroups[5]],
    equipment: [mockEquipment[0], mockEquipment[8]],
    difficulty: 3,
    videoUrl: '/videos/squat.mp4',
    imageUrl: '/images/squat.jpg',
    commonMistakes: [
      'Knees caving inward',
      'Forward lean',
      'Not reaching proper depth'
    ],
    tips: [
      'Keep chest up and proud',
      'Drive knees out',
      'Maintain neutral spine'
    ],
    variations: [
      {
        id: 'var-3',
        name: 'Front Squat',
        description: 'Anterior-loaded squat variation',
        difficulty: 4,
        equipment: [mockEquipment[0], mockEquipment[8]],
      }
    ],
    category: mockExerciseCategories[0],
  },
  {
    id: 'ex-4',
    name: 'Pull-ups',
    description: 'Bodyweight back and arm exercise',
    instructions: [
      'Hang from bar with palms facing away',
      'Start with arms fully extended',
      'Pull body up until chin clears bar',
      'Lower with control to full extension',
      'Avoid swinging or kipping'
    ],
    muscleGroups: [mockMuscleGroups[1], mockMuscleGroups[7]],
    equipment: [mockEquipment[2]],
    difficulty: 4,
    videoUrl: '/videos/pullups.mp4',
    imageUrl: '/images/pullups.jpg',
    commonMistakes: [
      'Using momentum',
      'Not achieving full range of motion',
      'Shrugging shoulders'
    ],
    tips: [
      'Engage lats first',
      'Keep core tight',
      'Focus on quality over quantity'
    ],
    variations: [
      {
        id: 'var-4',
        name: 'Chin-ups',
        description: 'Underhand grip variation',
        difficulty: 3,
        equipment: [mockEquipment[2]],
      }
    ],
    category: mockExerciseCategories[0],
  },
  {
    id: 'ex-5',
    name: 'Overhead Press',
    description: 'Standing shoulder and arm exercise',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold barbell at shoulder height',
      'Press bar straight up overhead',
      'Keep core braced throughout',
      'Lower bar to starting position'
    ],
    muscleGroups: [mockMuscleGroups[2], mockMuscleGroups[6]],
    equipment: [mockEquipment[0]],
    difficulty: 3,
    videoUrl: '/videos/overhead-press.mp4',
    imageUrl: '/images/overhead-press.jpg',
    commonMistakes: [
      'Pressing bar forward',
      'Arching back excessively',
      'Not engaging core'
    ],
    tips: [
      'Keep bar path vertical',
      'Squeeze glutes',
      'Drive head through at top'
    ],
    variations: [
      {
        id: 'var-5',
        name: 'Seated Overhead Press',
        description: 'Seated variation for stability',
        difficulty: 2,
        equipment: [mockEquipment[0], mockEquipment[7]],
      }
    ],
    category: mockExerciseCategories[0],
  },
  // Adding more exercises to reach 50 total
  {
    id: 'ex-6',
    name: 'Dumbbell Row',
    description: 'Single-arm back exercise',
    instructions: [
      'Place one knee and hand on bench',
      'Hold dumbbell in opposite hand',
      'Pull dumbbell to hip',
      'Squeeze shoulder blade at top',
      'Lower with control'
    ],
    muscleGroups: [mockMuscleGroups[1], mockMuscleGroups[7]],
    equipment: [mockEquipment[1], mockEquipment[7]],
    difficulty: 2,
    category: mockExerciseCategories[0],
  },
  {
    id: 'ex-7',
    name: 'Push-ups',
    description: 'Bodyweight chest exercise',
    instructions: [
      'Start in plank position',
      'Lower chest to floor',
      'Push back to starting position',
      'Keep body in straight line',
      'Control the movement'
    ],
    muscleGroups: [mockMuscleGroups[0], mockMuscleGroups[6]],
    equipment: [mockEquipment[9]],
    difficulty: 2,
    category: mockExerciseCategories[0],
  },
  // ... Continue with more exercises to reach 50
];

// Mock Fitness Goals
export const mockFitnessGoals: FitnessGoal[] = [
  {
    id: 'goal-1',
    type: 'build_muscle',
    name: 'Build Muscle',
    description: 'Increase muscle mass and size',
    isActive: true,
  },
  {
    id: 'goal-2',
    type: 'get_stronger',
    name: 'Get Stronger',
    description: 'Improve overall strength and power',
    isActive: true,
  },
  {
    id: 'goal-3',
    type: 'lose_weight',
    name: 'Lose Weight',
    description: 'Reduce body fat and improve body composition',
    isActive: false,
  },
  {
    id: 'goal-4',
    type: 'improve_endurance',
    name: 'Improve Endurance',
    description: 'Build cardiovascular fitness and stamina',
    isActive: false,
  },
  {
    id: 'goal-5',
    type: 'general_fitness',
    name: 'General Fitness',
    description: 'Overall health and fitness improvement',
    isActive: false,
  },
];

// Mock Workout Plans
export const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'plan-1',
    userId: 'user-1',
    name: 'Strength Builder 4-Week Program',
    description: 'Progressive strength training plan focusing on compound movements',
    duration: 4,
    workoutsPerWeek: 3,
    weeks: [
      {
        id: 'week-1',
        weekNumber: 1,
        theme: 'Foundation Building',
        workouts: [
          {
            id: 'workout-1',
            name: 'Upper Body Strength',
            description: 'Focus on chest, back, and shoulders',
            estimatedDuration: 60,
            exercises: [
              {
                id: 'we-1',
                exerciseId: 'ex-1',
                exercise: mockExercises[0],
                sets: 3,
                reps: 8,
                weight: 135,
                restSeconds: 120,
                order: 1,
              },
              {
                id: 'we-2',
                exerciseId: 'ex-4',
                exercise: mockExercises[3],
                sets: 3,
                reps: 5,
                restSeconds: 120,
                order: 2,
              },
            ],
            restPeriods: [],
            difficulty: 3,
            muscleGroups: [mockMuscleGroups[0], mockMuscleGroups[1]],
            equipmentNeeded: [mockEquipment[0], mockEquipment[2]],
          },
        ],
      },
    ],
    templateType: 'strength',
    createdAt: new Date(),
    isActive: true,
  },
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    name: 'First Workout',
    description: 'Complete your first workout',
    iconUrl: '/icons/first-workout.svg',
    category: 'milestone',
    rarity: 'common',
    requirements: [
      {
        type: 'workout_count',
        value: 1,
        description: 'Complete 1 workout',
      },
    ],
  },
  {
    id: 'ach-2',
    name: 'Week Warrior',
    description: 'Complete 7 consecutive days of workouts',
    iconUrl: '/icons/week-warrior.svg',
    category: 'consistency',
    rarity: 'rare',
    requirements: [
      {
        type: 'streak',
        value: 7,
        description: 'Maintain 7-day workout streak',
      },
    ],
  },
  {
    id: 'ach-3',
    name: 'Strength Milestone',
    description: 'Lift 2x your bodyweight in deadlift',
    iconUrl: '/icons/strength-milestone.svg',
    category: 'strength',
    rarity: 'epic',
    requirements: [
      {
        type: 'weight_lifted',
        value: 315, // Example weight
        description: 'Deadlift 2x bodyweight',
      },
    ],
  },
];

// Helper functions for mock API responses
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiResponse = <T>(data: T, delay_ms = 500) => {
  return new Promise<{ data: T; success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        success: true,
        message: 'Success',
      });
    }, delay_ms);
  });
};