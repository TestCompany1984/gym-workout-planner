import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  currentPage: string;
  isOnboarding: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Notification[];
  
  // Preferences
  preferences: UserPreferences;
}

interface UserPreferences {
  // Sound preferences
  soundEnabled: boolean;
  motivationalMessages: boolean;
  timerSounds: boolean;
  
  // Display preferences
  units: 'metric' | 'imperial';
  dateFormat: 'US' | 'EU';
  showRestTimer: boolean;
  showProgressAnimations: boolean;
  
  // Privacy preferences
  shareProgress: boolean;
  publicProfile: boolean;
  
  // Workout preferences
  defaultRestTime: number; // seconds
  autoAdvanceExercises: boolean;
  showExerciseVideos: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // ms, undefined = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface AppActions {
  // UI actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Preference actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

type AppStore = AppState & AppActions;

const defaultPreferences: UserPreferences = {
  soundEnabled: true,
  motivationalMessages: true,
  timerSounds: true,
  units: 'metric',
  dateFormat: 'US',
  showRestTimer: true,
  showProgressAnimations: true,
  shareProgress: false,
  publicProfile: false,
  defaultRestTime: 90,
  autoAdvanceExercises: false,
  showExerciseVideos: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      currentPage: '/',
      isOnboarding: false,
      theme: 'dark', // Default to dark for gym aesthetic
      globalLoading: false,
      loadingMessage: '',
      notifications: [],
      preferences: defaultPreferences,

      // UI actions
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      setOnboarding: (isOnboarding) => {
        set({ isOnboarding });
      },

      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      // Loading actions
      setGlobalLoading: (loading, message = '') => {
        set({ 
          globalLoading: loading,
          loadingMessage: message 
        });
      },

      // Notification actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notification-${Date.now()}-${Math.random()}`,
          createdAt: new Date(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification if duration is set
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Preference actions
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        }));
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        isOnboarding: state.isOnboarding,
      }),
    }
  )
);

// Convenience hooks for common actions
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useAppStore();
  
  const showSuccess = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'success', title, message, duration });
  };
  
  const showError = (title: string, message: string, duration = 8000) => {
    addNotification({ type: 'error', title, message, duration });
  };
  
  const showWarning = (title: string, message: string, duration = 6000) => {
    addNotification({ type: 'warning', title, message, duration });
  };
  
  const showInfo = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'info', title, message, duration });
  };
  
  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
};