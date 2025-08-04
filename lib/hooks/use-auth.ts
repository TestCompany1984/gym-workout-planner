import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { useNotifications } from '../stores/app-store';
import { mockApi } from '../api/mock-api';
import { queryKeys } from '../query-client';
import type { User, UserProfile } from '../types';

// Hook for getting current user
export const useCurrentUser = () => {
  const { user, setUser, setLoading, setError } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => {
      const response = await mockApi.auth.getCurrentUser();
      return response.data;
    },
    enabled: !user, // Only fetch if we don't have a user
    onSuccess: (data) => {
      setUser(data);
      setLoading(false);
    },
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

// Hook for user profile
export const useUserProfile = (userId: string) => {
  const { setProfile } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: async () => {
      const response = await mockApi.profile.getProfile(userId);
      return response.data;
    },
    enabled: !!userId,
    onSuccess: (data) => {
      if (data) {
        setProfile(data);
      }
    },
  });
};

// Sign up mutation
export const useSignUp = () => {
  const { setUser, setLoading, setError } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      setLoading(true);
      const response = await mockApi.auth.signUp(email, password, name);
      return response.data;
    },
    onSuccess: (user: User) => {
      setUser(user);
      setLoading(false);
      showSuccess('Welcome!', 'Your account has been created successfully');
      
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
    },
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
      showError('Sign Up Failed', error.message || 'Failed to create account');
    },
  });
};

// Sign in mutation
export const useSignIn = () => {
  const { setUser, setLoading, setError } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      const response = await mockApi.auth.signIn(email, password);
      return response.data;
    },
    onSuccess: (user: User) => {
      setUser(user);
      setLoading(false);
      showSuccess('Welcome back!', 'You have been signed in successfully');
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(user.id) });
    },
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
      showError('Sign In Failed', error.message || 'Invalid credentials');
    },
  });
};

// Sign out mutation
export const useSignOut = () => {
  const { logout } = useAuthStore();
  const { showSuccess } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await mockApi.auth.signOut();
    },
    onSuccess: () => {
      logout();
      showSuccess('Goodbye!', 'You have been signed out');
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Create profile mutation
export const useCreateProfile = () => {
  const { setProfile } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await mockApi.profile.createProfile(profileData);
      return response.data;
    },
    onSuccess: (profile: UserProfile) => {
      setProfile(profile);
      showSuccess('Profile Created', 'Your fitness profile has been set up');
      
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(profile.userId) });
    },
    onError: (error: any) => {
      showError('Profile Creation Failed', error.message || 'Failed to create profile');
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const { updateProfile } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      const response = await mockApi.profile.updateProfile(userId, updates);
      return response.data;
    },
    onSuccess: (profile: UserProfile) => {
      updateProfile(profile);
      showSuccess('Profile Updated', 'Your changes have been saved');
      
      // Update cached profile data
      queryClient.setQueryData(queryKeys.auth.profile(profile.userId), profile);
    },
    onError: (error: any) => {
      showError('Update Failed', error.message || 'Failed to update profile');
    },
  });
};

// Demo login helper
export const useDemoLogin = () => {
  const signIn = useSignIn();
  
  const loginAsDemo = () => {
    signIn.mutate({
      email: 'demo@gym.com',
      password: 'demo123',
    });
  };
  
  return {
    loginAsDemo,
    isLoading: signIn.isPending,
  };
};

// Hook for auth state
export const useAuth = () => {
  const authStore = useAuthStore();
  
  return {
    ...authStore,
    isLoading: authStore.isLoading,
    hasProfile: !!authStore.profile,
    isComplete: !!(authStore.user && authStore.profile),
  };
};