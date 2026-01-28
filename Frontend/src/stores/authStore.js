import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = 'http://localhost:8080';


export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid username or password');
          }

          const data = await response.json();

          // Store token
          if (data.token) {
            localStorage.setItem('auth-token', data.token);
          }

          set({
            user: {
              id: data.userId,
              username: data.username,
              role: data.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message || 'Invalid username or password',
            isLoading: false,
          });
        }
      },


      signup: async (username, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
          }

          const data = await response.json();

          // Store token
          if (data.token) {
            localStorage.setItem('auth-token', data.token);
          }

          set({
            user: {
              id: data.userId,
              username: data.username,
              role: data.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message || 'Signup failed',
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      // Admin functions
      getAllUsers: async () => {
        try {
          const token = localStorage.getItem('auth-token');
          const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch users');
          }

          const data = await response.json();

          // Map backend response to expected format
          return data.map(user => ({
            id: user.userId,        // Changed from user_id to userId
            username: user.username,
            role: user.role,
          }));
        } catch (error) {
          console.error('Error fetching users:', error);
          return [];
        }
      },

      updateUserRole: async (userId, newRole) => {
        try {
          console.log(userId, newRole);
          const token = localStorage.getItem('auth-token');
          const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user role');
          }

          return true;
        } catch (error) {
          console.error('Error updating user role:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
