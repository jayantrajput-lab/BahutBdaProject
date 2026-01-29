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
        localStorage.removeItem('auth-token');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      // Admin functions
      getUserCounts: async () => {
        try {
          const token = localStorage.getItem('auth-token');
          const response = await fetch(`${API_BASE_URL}/admin/userCounts`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user counts');
          }

          return await response.json();
        } catch (error) {
          console.error('Error fetching user counts:', error);
          return { total: 0, ADMIN: 0, MAKER: 0, CHECKER: 0, USER: 0 };
        }
      },

      createUser: async (username, password, role) => {
        try {
          const token = localStorage.getItem('auth-token');
          const response = await fetch(`${API_BASE_URL}/admin/createUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username, password, role }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create user');
          }

          return { success: true, data: await response.json() };
        } catch (error) {
          console.error('Error creating user:', error);
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
