import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const useUserStore = create((set, get) => ({
  // State
  transactions: [],
  extractedFields: null,
  isLoading: false,
  error: null,

  // Fetch user's transactions
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/user/transactions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch transactions');
      }

      const data = await response.json();
      set({ transactions: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Find pattern for SMS
  findPattern: async (sms, smsTitle) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/user/findPattern`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sms, smsTitle }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to find pattern');
      }

      const data = await response.json();
      set({ extractedFields: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Save transaction to history
  saveTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/user/saveTransaction`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save transaction');
      }

      const data = await response.json();
      set({ isLoading: false });
      // Refresh transactions list
      get().fetchTransactions();
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
