import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const useMakerStore = create((set, get) => ({
  // State
  extractedFields: null,
  patternCheckResult: null,  // Result of pattern existence check
  isLoading: false,
  isChecking: false,  // Loading state for pattern check
  error: null,
  draftPatterns: [],
  rejectedPatterns: [],
  failedPatterns: [],

  // Extract fields using regex pattern and SMS
  extractFields: async (regexPattern, sms) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/extractFields`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ regexPattern, sms }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to extract fields');
      }

      const data = await response.json();
      console.log("data in maker store : " , data);
      set({ extractedFields: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Save pattern as draft
  saveDraft: async (patternData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/saveDraft`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(patternData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save draft');
      }

      const data = await response.json();
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Save pattern as pending (submit for approval) - creates new entry
  savePending: async (patternData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/savePending`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(patternData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit for approval');
      }

      const data = await response.json();
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Submit existing draft for approval (updates existing entry to PENDING)
  submitDraft: async (patternId, patternData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/submitDraft/${patternId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(patternData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit draft for approval');
      }

      const data = await response.json();
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update existing draft (keeps as DRAFT)
  updateDraft: async (patternId, patternData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/updateDraft/${patternId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(patternData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update draft');
      }

      const data = await response.json();
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch draft patterns
  fetchDrafts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/getDrafts`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch draft patterns');
      }

      const data = await response.json();
      set({ draftPatterns: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch rejected patterns
  fetchRejected: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/getRejected`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch rejected patterns');
      }

      const data = await response.json();
      set({ rejectedPatterns: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch failed patterns
  fetchFailed: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/getFailed`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch failed patterns');
      }

      const data = await response.json();
      set({ failedPatterns: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Check if pattern already exists for SMS
  checkPattern: async (sms, smsTitle) => {
    set({ isChecking: true, error: null, patternCheckResult: null });
    try {
      const response = await fetch(`${API_BASE_URL}/maker/checkPattern`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sms, smsTitle }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to check pattern');
      }

      const data = await response.json();
      set({ patternCheckResult: data, isChecking: false });
      return data;
    } catch (error) {
      set({ error: error.message, isChecking: false });
      throw error;
    }
  },

  // Clear pattern check result
  clearPatternCheckResult: () => set({ patternCheckResult: null }),

  // Clear extracted fields
  clearExtractedFields: () => set({ extractedFields: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
