import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkoutStore } from '../stores/workout-store';
import { useNotifications } from '../stores/app-store';
import { mockApi } from '../api/mock-api';
import { queryKeys } from '../query-client';
import type { WorkoutPlan, Workout, FitnessGoal, Equipment } from '../types';

// Hook for user's workout plans
export const useWorkoutPlans = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.workouts.plans(userId),
    queryFn: async () => {
      const response = await mockApi.workoutPlan.getUserPlans(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

// Hook for specific workout plan
export const useWorkoutPlan = (planId: string) => {
  return useQuery({
    queryKey: queryKeys.workouts.plan(planId),
    queryFn: async () => {
      const response = await mockApi.workoutPlan.getPlan(planId);
      return response.data;
    },
    enabled: !!planId,
  });
};

// Hook for generating new workout plan
export const useGenerateWorkoutPlan = () => {
  const { setCurrentPlan } = useWorkoutStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      goals,
      equipment,
      experience,
    }: {
      userId: string;
      goals: FitnessGoal[];
      equipment: Equipment[];
      experience: 'beginner' | 'intermediate' | 'advanced';
    }) => {
      const response = await mockApi.workoutPlan.generatePlan(userId, goals, equipment, experience);
      return response.data;
    },
    onSuccess: (plan: WorkoutPlan) => {
      setCurrentPlan(plan);
      showSuccess('Plan Generated!', 'Your personalized 4-week workout plan is ready');
      
      // Invalidate plans list to include new plan
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.plans(plan.userId) });
    },
    onError: (error: any) => {
      showError('Generation Failed', error.message || 'Failed to generate workout plan');
    },
  });
};

// Hook for starting a workout plan
export const useStartWorkoutPlan = () => {
  const { setCurrentPlan } = useWorkoutStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await mockApi.workoutPlan.startPlan(planId);
      return response.data;
    },
    onSuccess: (plan: WorkoutPlan) => {
      setCurrentPlan(plan);
      showSuccess('Plan Started!', 'Your workout journey begins now');
      
      // Update cached plan data
      queryClient.setQueryData(queryKeys.workouts.plan(plan.id), plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.plans(plan.userId) });
    },
    onError: (error: any) => {
      showError('Start Failed', error.message || 'Failed to start workout plan');
    },
  });
};

// Hook for completing a workout plan
export const useCompleteWorkoutPlan = () => {
  const { setCurrentPlan } = useWorkoutStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await mockApi.workoutPlan.completePlan(planId);
      return response.data;
    },
    onSuccess: (plan: WorkoutPlan) => {
      setCurrentPlan(null);
      showSuccess('Congratulations!', 'You completed your 4-week workout plan! 🎉');
      
      // Update cached data
      queryClient.setQueryData(queryKeys.workouts.plan(plan.id), plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.plans(plan.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.metrics(plan.userId) });
    },
    onError: (error: any) => {
      showError('Completion Failed', error.message || 'Failed to complete workout plan');
    },
  });
};

// Hook for workout history
export const useWorkoutHistory = (userId: string, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.workouts.history(userId),
    queryFn: async () => {
      const response = await mockApi.progress.getWorkoutHistory(userId, limit);
      return response;
    },
    enabled: !!userId,
  });
};

// Hook for active workout management
export const useActiveWorkout = () => {
  const workoutStore = useWorkoutStore();
  const { showSuccess, showError, showInfo } = useNotifications();
  
  const startWorkout = (workout: Workout) => {
    workoutStore.startWorkout(workout);
    showInfo('Workout Started', `Let's crush ${workout.name}!`);
  };
  
  const endWorkout = () => {
    if (workoutStore.activeWorkout) {
      const duration = Math.round(
        (Date.now() - workoutStore.activeWorkout.startedAt.getTime()) / 1000 / 60
      );
      
      workoutStore.endWorkout();
      showSuccess(
        'Workout Complete!', 
        `Great job! You finished in ${duration} minutes 💪`
      );
    }
  };
  
  const pauseWorkout = () => {
    workoutStore.pauseWorkout();
    showInfo('Workout Paused', 'Take your time, we\'ll wait for you');
  };
  
  const resumeWorkout = () => {
    workoutStore.resumeWorkout();
    showInfo('Let\'s Go!', 'Back to crushing it! 🔥');
  };
  
  return {
    ...workoutStore,
    startWorkout,
    endWorkout,
    pauseWorkout,
    resumeWorkout,
  };
};

// Hook for workout timer
export const useWorkoutTimer = () => {
  const { timerState, startTimer, stopTimer, skipTimer, addTime } = useWorkoutStore();
  const { showInfo } = useNotifications();
  
  const startRestTimer = (duration: number) => {
    startTimer(duration, 'rest');
    showInfo('Rest Time', `Take ${Math.round(duration / 60)} minutes to recover`);
  };
  
  const startExerciseTimer = (duration: number) => {
    startTimer(duration, 'exercise');
    showInfo('Exercise Time', 'Time to work! Give it your all');
  };
  
  const skipRestPeriod = () => {
    if (timerState.canSkip) {
      skipTimer();
      showInfo('Rest Skipped', 'Ready to keep going? Let\'s do this!');
    }
  };
  
  const addRestTime = (seconds: number) => {
    addTime(seconds);
    showInfo('Time Added', `Added ${seconds} seconds to your rest`);
  };
  
  return {
    timerState,
    startRestTimer,
    startExerciseTimer,
    stopTimer,
    skipRestPeriod,
    addRestTime,
    isResting: timerState.type === 'rest' && timerState.isActive,
    isExercising: timerState.type === 'exercise' && timerState.isActive,
    timeRemaining: timerState.timeRemaining,
    progress: timerState.totalTime > 0 
      ? ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100 
      : 0,
  };
};

// Hook for exercise logging during workout
export const useExerciseLogging = () => {
  const { activeWorkout, logSet, updateCurrentSet } = useWorkoutStore();
  const { showSuccess } = useNotifications();
  
  const logExerciseSet = (exerciseId: string, weight?: number, reps?: number, notes?: string) => {
    if (activeWorkout) {
      logSet(exerciseId, weight, reps, notes);
      
      const currentExercise = activeWorkout.workout.exercises[activeWorkout.currentExerciseIndex];
      const isLastSet = activeWorkout.currentSet >= currentExercise.sets;
      
      if (isLastSet) {
        showSuccess('Exercise Complete!', `Great work on ${currentExercise.exercise.name}!`);
      } else {
        showSuccess('Set Logged', `Set ${activeWorkout.currentSet} completed`);
      }
    }
  };
  
  const getCurrentExercise = () => {
    if (!activeWorkout) return null;
    return activeWorkout.workout.exercises[activeWorkout.currentExerciseIndex];
  };
  
  const getExerciseProgress = () => {
    if (!activeWorkout) return { completed: 0, total: 0 };
    
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return { completed: 0, total: 0 };
    
    const completedSets = activeWorkout.exerciseLogs.filter(
      log => log.exerciseId === currentExercise.exerciseId
    ).length;
    
    return {
      completed: completedSets,
      total: currentExercise.sets,
      current: activeWorkout.currentSet,
    };
  };
  
  return {
    activeWorkout,
    logExerciseSet,
    updateCurrentSet,
    getCurrentExercise,
    getExerciseProgress,
    canLogSet: !!activeWorkout,
  };
};