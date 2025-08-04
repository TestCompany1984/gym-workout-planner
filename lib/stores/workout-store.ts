import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  WorkoutPlan, 
  ActiveWorkout, 
  ExerciseLog, 
  WorkoutTimerState,
  Workout 
} from '../types';

interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  activeWorkout: ActiveWorkout | null;
  timerState: WorkoutTimerState;
  exerciseLogs: ExerciseLog[];
  workoutHistory: string[]; // workout IDs
  isLoading: boolean;
  error: string | null;
}

interface WorkoutActions {
  // Plan management
  setCurrentPlan: (plan: WorkoutPlan | null) => void;
  
  // Active workout management
  startWorkout: (workout: Workout) => void;
  endWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  
  // Exercise navigation
  nextExercise: () => void;
  previousExercise: () => void;
  goToExercise: (index: number) => void;
  
  // Set tracking
  logSet: (exerciseId: string, weight?: number, reps?: number, notes?: string) => void;
  updateCurrentSet: (setNumber: number) => void;
  
  // Timer management
  startTimer: (duration: number, type: 'rest' | 'exercise') => void;
  stopTimer: () => void;
  skipTimer: () => void;
  addTime: (seconds: number) => void;
  
  // History and progress
  addToHistory: (workoutId: string) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Reset state
  resetWorkoutState: () => void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

const initialTimerState: WorkoutTimerState = {
  isActive: false,
  timeRemaining: 0,
  totalTime: 0,
  type: 'rest',
  canSkip: true,
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPlan: null,
      activeWorkout: null,
      timerState: initialTimerState,
      exerciseLogs: [],
      workoutHistory: [],
      isLoading: false,
      error: null,

      // Plan management
      setCurrentPlan: (plan) => {
        set({ currentPlan: plan });
      },

      // Active workout management
      startWorkout: (workout) => {
        const activeWorkout: ActiveWorkout = {
          id: `active-${Date.now()}`,
          workoutId: workout.id,
          workout,
          userId: '', // Will be set from auth store
          startedAt: new Date(),
          currentExerciseIndex: 0,
          currentSet: 1,
          exerciseLogs: [],
        };
        
        set({ 
          activeWorkout,
          exerciseLogs: [],
          error: null 
        });
      },

      endWorkout: () => {
        const { activeWorkout, exerciseLogs } = get();
        
        if (activeWorkout) {
          const completedWorkout: ActiveWorkout = {
            ...activeWorkout,
            completedAt: new Date(),
            totalDuration: Date.now() - activeWorkout.startedAt.getTime(),
            exerciseLogs,
          };
          
          // Add to history
          get().addToHistory(activeWorkout.workoutId);
        }
        
        set({ 
          activeWorkout: null,
          exerciseLogs: [],
          timerState: initialTimerState,
        });
      },

      pauseWorkout: () => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            isActive: false,
          },
        }));
      },

      resumeWorkout: () => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            isActive: true,
          },
        }));
      },

      // Exercise navigation
      nextExercise: () => {
        set((state) => {
          const { activeWorkout } = state;
          if (!activeWorkout) return state;

          const nextIndex = activeWorkout.currentExerciseIndex + 1;
          const maxIndex = activeWorkout.workout.exercises.length - 1;

          return {
            activeWorkout: {
              ...activeWorkout,
              currentExerciseIndex: Math.min(nextIndex, maxIndex),
              currentSet: 1,
            },
          };
        });
      },

      previousExercise: () => {
        set((state) => {
          const { activeWorkout } = state;
          if (!activeWorkout) return state;

          const prevIndex = activeWorkout.currentExerciseIndex - 1;

          return {
            activeWorkout: {
              ...activeWorkout,
              currentExerciseIndex: Math.max(prevIndex, 0),
              currentSet: 1,
            },
          };
        });
      },

      goToExercise: (index) => {
        set((state) => {
          const { activeWorkout } = state;
          if (!activeWorkout) return state;

          const maxIndex = activeWorkout.workout.exercises.length - 1;
          const validIndex = Math.max(0, Math.min(index, maxIndex));

          return {
            activeWorkout: {
              ...activeWorkout,
              currentExerciseIndex: validIndex,
              currentSet: 1,
            },
          };
        });
      },

      // Set tracking
      logSet: (exerciseId, weight, reps, notes) => {
        const { activeWorkout, exerciseLogs } = get();
        if (!activeWorkout) return;

        const newLog: ExerciseLog = {
          id: `log-${Date.now()}`,
          activeWorkoutId: activeWorkout.id,
          exerciseId,
          setNumber: activeWorkout.currentSet,
          weight,
          reps: reps || 0,
          completedAt: new Date(),
          notes,
        };

        const updatedLogs = [...exerciseLogs, newLog];
        const currentExercise = activeWorkout.workout.exercises[activeWorkout.currentExerciseIndex];
        const nextSet = activeWorkout.currentSet + 1;

        set({
          exerciseLogs: updatedLogs,
          activeWorkout: {
            ...activeWorkout,
            currentSet: nextSet <= currentExercise.sets ? nextSet : activeWorkout.currentSet,
            exerciseLogs: updatedLogs,
          },
        });
      },

      updateCurrentSet: (setNumber) => {
        set((state) => {
          const { activeWorkout } = state;
          if (!activeWorkout) return state;

          return {
            activeWorkout: {
              ...activeWorkout,
              currentSet: setNumber,
            },
          };
        });
      },

      // Timer management
      startTimer: (duration, type) => {
        set({
          timerState: {
            isActive: true,
            timeRemaining: duration,
            totalTime: duration,
            type,
            canSkip: type === 'rest',
          },
        });
      },

      stopTimer: () => {
        set({
          timerState: initialTimerState,
        });
      },

      skipTimer: () => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            isActive: false,
            timeRemaining: 0,
          },
        }));
      },

      addTime: (seconds) => {
        set((state) => ({
          timerState: {
            ...state.timerState,
            timeRemaining: state.timerState.timeRemaining + seconds,
            totalTime: state.timerState.totalTime + seconds,
          },
        }));
      },

      // History and progress
      addToHistory: (workoutId) => {
        set((state) => ({
          workoutHistory: [...state.workoutHistory, workoutId],
        }));
      },

      // Error handling
      setError: (error) => {
        set({ error });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Reset state
      resetWorkoutState: () => {
        set({
          activeWorkout: null,
          timerState: initialTimerState,
          exerciseLogs: [],
          error: null,
        });
      },
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        workoutHistory: state.workoutHistory,
      }),
    }
  )
);