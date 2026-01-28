import { create } from 'zustand';
import { API_BASE_URL } from '../services/api';

const useCheckerStore = create((set, get) => ({
  // State
  pendings: [],
  extractedFields: null,
  isLoading: false,
  error: null,

  // Fetch pending patterns
  fetchPendings: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_BASE_URL}/checker/getPendings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch pending patterns');
      }
      const data = await response.json();
      set({ pendings: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Extract fields from regex pattern and sms
  extractFields: async (regexPattern, sms) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_BASE_URL}/checker/extractFields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regexPattern, sms }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to extract fields');
      }
      const data = await response.json();
      set({ extractedFields: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Approve pattern (with all fields)
  approvePattern: async (patternData) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_BASE_URL}/checker/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patternData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve pattern');
      }
      const data = await response.json();
      set({ isLoading: false });
      // Refresh pendings after approval
      get().fetchPendings();
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Reject pattern (with all fields)
  rejectPattern: async (patternData) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`${API_BASE_URL}/checker/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patternData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reject pattern');
      }
      const data = await response.json();
      set({ isLoading: false });
      // Refresh pendings after rejection
      get().fetchPendings();
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Clear extracted fields
  clearExtractedFields: () => set({ extractedFields: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useCheckerStore;
