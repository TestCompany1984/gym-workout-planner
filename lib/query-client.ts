import { QueryClient } from '@tanstack/react-query';

// Create a query client with gym app specific configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query options
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: (failureCount, error) => {
        // Custom retry logic
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Global mutation options
      retry: 1, // Retry failed mutations once
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth queries
  auth: {
    currentUser: ['auth', 'currentUser'],
    profile: (userId: string) => ['auth', 'profile', userId],
  },
  
  // Workout queries
  workouts: {
    all: ['workouts'],
    plans: (userId: string) => ['workouts', 'plans', userId],
    plan: (planId: string) => ['workouts', 'plan', planId],
    active: (userId: string) => ['workouts', 'active', userId],
    history: (userId: string) => ['workouts', 'history', userId],
  },
  
  // Exercise queries
  exercises: {
    all: ['exercises'],
    list: (filters?: any) => ['exercises', 'list', filters],
    detail: (exerciseId: string) => ['exercises', 'detail', exerciseId],
    favorites: (userId: string) => ['exercises', 'favorites', userId],
  },
  
  // Equipment queries
  equipment: {
    all: ['equipment'],
    user: (userId: string) => ['equipment', 'user', userId],
  },
  
  // Progress queries
  progress: {
    metrics: (userId: string) => ['progress', 'metrics', userId],
    charts: (userId: string, timeRange: string) => ['progress', 'charts', userId, timeRange],
    achievements: (userId: string) => ['progress', 'achievements', userId],
  },
  
  // Goals queries
  goals: {
    all: ['goals'],
    user: (userId: string) => ['goals', 'user', userId],
  },
} as const;

// Custom query client for gym app with specific error handling
export const createGymQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on authentication errors
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          
          // Don't retry on client errors (4xx) except 408, 429
          if (error?.status >= 400 && error?.status < 500 && 
              error?.status !== 408 && error?.status !== 429) {
            return false;
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff with jitter
          const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
          const jitter = Math.random() * 0.1 * baseDelay;
          return baseDelay + jitter;
        },
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Similar retry logic for mutations
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          return failureCount < 1;
        },
        onError: (error: any) => {
          // Global error handling for mutations
          console.error('Mutation error:', error);
          
          // Handle specific error types
          if (error?.status === 401) {
            // Redirect to login or show auth modal
            console.log('Authentication required');
          } else if (error?.status >= 500) {
            // Show generic server error message
            console.log('Server error occurred');
          }
        },
      },
    },
  });
};