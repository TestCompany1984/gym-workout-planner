import type { 
  User, 
  UserProfile, 
  WorkoutPlan, 
  Exercise, 
  Equipment, 
  FitnessGoal,
  ProgressMetrics,
  Achievement,
  ExerciseFilters,
  ApiResponse,
  PaginatedResponse
} from '../types';

import { 
  mockExercises, 
  mockEquipment, 
  mockFitnessGoals, 
  mockWorkoutPlans, 
  mockAchievements,
  mockApiResponse,
  delay 
} from './mock-data';

// Authentication API
export const authApi = {
  async signUp(email: string, password: string, name: string): Promise<ApiResponse<User>> {
    await delay(1000);
    
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date(),
    };
    
    return mockApiResponse(user);
  },

  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    await delay(800);
    
    // Mock authentication logic
    if (email === 'demo@gym.com' && password === 'demo123') {
      const user: User = {
        id: 'user-demo',
        email,
        name: 'Demo User',
        createdAt: new Date('2024-01-01'),
      };
      return mockApiResponse(user);
    }
    
    throw new Error('Invalid credentials');
  },

  async signOut(): Promise<ApiResponse<null>> {
    await delay(300);
    return mockApiResponse(null);
  },

  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    await delay(500);
    
    // Mock getting current user from session
    const user: User = {
      id: 'user-demo',
      email: 'demo@gym.com',
      name: 'Demo User',
      createdAt: new Date('2024-01-01'),
    };
    
    return mockApiResponse(user);
  },
};

// User Profile API
export const profileApi = {
  async createProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<UserProfile>> {
    await delay(800);
    
    const newProfile: UserProfile = {
      ...profile,
      id: `profile-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return mockApiResponse(newProfile);
  },

  async getProfile(userId: string): Promise<ApiResponse<UserProfile | null>> {
    await delay(400);
    
    // Mock profile data
    const profile: UserProfile = {
      id: 'profile-demo',
      userId,
      experienceLevel: 'intermediate',
      fitnessGoals: mockFitnessGoals.filter(g => g.isActive),
      availableEquipment: mockEquipment.filter(e => e.isAvailable),
      preferredWorkoutDays: 4,
      timePerWorkout: 60,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };
    
    return mockApiResponse(profile);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    await delay(600);
    
    // Mock updated profile
    const updatedProfile: UserProfile = {
      id: 'profile-demo',
      userId,
      experienceLevel: 'intermediate',
      fitnessGoals: mockFitnessGoals.filter(g => g.isActive),
      availableEquipment: mockEquipment.filter(e => e.isAvailable),
      preferredWorkoutDays: 4,
      timePerWorkout: 60,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      ...updates,
    };
    
    return mockApiResponse(updatedProfile);
  },
};

// Workout Plan API
export const workoutPlanApi = {
  async generatePlan(
    userId: string, 
    goals: FitnessGoal[], 
    equipment: Equipment[], 
    experience: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ApiResponse<WorkoutPlan>> {
    await delay(2000); // Simulate AI generation time
    
    const plan = mockWorkoutPlans[0];
    return mockApiResponse({
      ...plan,
      userId,
      createdAt: new Date(),
    });
  },

  async getUserPlans(userId: string): Promise<ApiResponse<WorkoutPlan[]>> {
    await delay(600);
    return mockApiResponse(mockWorkoutPlans);
  },

  async getPlan(planId: string): Promise<ApiResponse<WorkoutPlan>> {
    await delay(400);
    const plan = mockWorkoutPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    return mockApiResponse(plan);
  },

  async startPlan(planId: string): Promise<ApiResponse<WorkoutPlan>> {
    await delay(500);
    const plan = mockWorkoutPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    
    return mockApiResponse({
      ...plan,
      startedAt: new Date(),
      isActive: true,
    });
  },

  async completePlan(planId: string): Promise<ApiResponse<WorkoutPlan>> {
    await delay(500);
    const plan = mockWorkoutPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    
    return mockApiResponse({
      ...plan,
      completedAt: new Date(),
      isActive: false,
    });
  },
};

// Exercise API
export const exerciseApi = {
  async getExercises(filters?: ExerciseFilters): Promise<PaginatedResponse<Exercise>> {
    await delay(400);
    
    let filteredExercises = [...mockExercises];
    
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters?.muscleGroups?.length) {
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.muscleGroups.some(mg => filters.muscleGroups!.includes(mg.id))
      );
    }
    
    if (filters?.equipment?.length) {
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.equipment.some(eq => filters.equipment!.includes(eq.id))
      );
    }
    
    if (filters?.difficulty?.length) {
      filteredExercises = filteredExercises.filter(exercise =>
        filters.difficulty!.includes(exercise.difficulty)
      );
    }
    
    return {
      data: filteredExercises,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredExercises.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  async getExercise(exerciseId: string): Promise<ApiResponse<Exercise>> {
    await delay(300);
    const exercise = mockExercises.find(e => e.id === exerciseId);
    if (!exercise) throw new Error('Exercise not found');
    return mockApiResponse(exercise);
  },

  async getFavoriteExercises(userId: string): Promise<ApiResponse<Exercise[]>> {
    await delay(400);
    // Mock favorite exercises (first 5)
    return mockApiResponse(mockExercises.slice(0, 5));
  },

  async addToFavorites(userId: string, exerciseId: string): Promise<ApiResponse<null>> {
    await delay(300);
    return mockApiResponse(null);
  },

  async removeFromFavorites(userId: string, exerciseId: string): Promise<ApiResponse<null>> {
    await delay(300);
    return mockApiResponse(null);
  },
};

// Equipment API
export const equipmentApi = {
  async getAllEquipment(): Promise<ApiResponse<Equipment[]>> {
    await delay(300);
    return mockApiResponse(mockEquipment);
  },

  async getUserEquipment(userId: string): Promise<ApiResponse<Equipment[]>> {
    await delay(400);
    return mockApiResponse(mockEquipment.filter(e => e.isAvailable));
  },

  async updateUserEquipment(userId: string, equipmentIds: string[]): Promise<ApiResponse<Equipment[]>> {
    await delay(500);
    const updatedEquipment = mockEquipment.map(eq => ({
      ...eq,
      isAvailable: equipmentIds.includes(eq.id),
    }));
    return mockApiResponse(updatedEquipment);
  },
};

// Progress API
export const progressApi = {
  async getProgressMetrics(userId: string): Promise<ApiResponse<ProgressMetrics>> {
    await delay(600);
    
    const metrics: ProgressMetrics = {
      userId,
      totalWorkouts: 42,
      currentStreak: 5,
      longestStreak: 12,
      totalVolume: 125000, // kg
      strengthProgress: [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          maxWeight: 135,
          oneRepMax: 155,
          volumePR: 4050,
          lastImprovement: new Date(),
          progressTrend: 'improving',
        },
        {
          exerciseId: 'ex-2',
          exerciseName: 'Deadlift',
          maxWeight: 225,
          oneRepMax: 275,
          volumePR: 6750,
          lastImprovement: new Date(),
          progressTrend: 'improving',
        },
      ],
      bodyMetrics: [
        {
          id: 'bm-1',
          userId,
          type: 'weight',
          value: 175,
          unit: 'lbs',
          recordedAt: new Date(),
        },
      ],
      goals: [],
      lastUpdated: new Date(),
    };
    
    return mockApiResponse(metrics);
  },

  async logWorkout(workoutData: any): Promise<ApiResponse<null>> {
    await delay(800);
    return mockApiResponse(null);
  },

  async getWorkoutHistory(userId: string, limit = 10): Promise<PaginatedResponse<any>> {
    await delay(500);
    
    // Mock workout history
    const history = Array.from({ length: limit }, (_, i) => ({
      id: `history-${i}`,
      workoutName: `Workout ${i + 1}`,
      completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      duration: 45 + Math.random() * 30,
      exercises: Math.floor(Math.random() * 8) + 4,
    }));
    
    return {
      data: history,
      pagination: {
        page: 1,
        limit,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      },
    };
  },
};

// Achievement API
export const achievementApi = {
  async getUserAchievements(userId: string): Promise<ApiResponse<Achievement[]>> {
    await delay(400);
    
    // Mock some earned achievements
    const achievements = mockAchievements.map((ach, index) => ({
      ...ach,
      earnedAt: index < 2 ? new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000) : undefined,
      progress: index < 2 ? 100 : Math.floor(Math.random() * 80) + 10,
    }));
    
    return mockApiResponse(achievements);
  },

  async checkForNewAchievements(userId: string): Promise<ApiResponse<Achievement[]>> {
    await delay(600);
    
    // Mock checking for new achievements after workout
    const newAchievements = Math.random() > 0.7 ? [mockAchievements[0]] : [];
    return mockApiResponse(newAchievements);
  },
};

// Goals API
export const goalsApi = {
  async getFitnessGoals(): Promise<ApiResponse<FitnessGoal[]>> {
    await delay(300);
    return mockApiResponse(mockFitnessGoals);
  },

  async updateUserGoals(userId: string, goalIds: string[]): Promise<ApiResponse<FitnessGoal[]>> {
    await delay(500);
    const updatedGoals = mockFitnessGoals.map(goal => ({
      ...goal,
      isActive: goalIds.includes(goal.id),
    }));
    return mockApiResponse(updatedGoals);
  },
};

// Consolidated API object
export const mockApi = {
  auth: authApi,
  profile: profileApi,
  workoutPlan: workoutPlanApi,
  exercise: exerciseApi,
  equipment: equipmentApi,
  progress: progressApi,
  achievement: achievementApi,
  goals: goalsApi,
};