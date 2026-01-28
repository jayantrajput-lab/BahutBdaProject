// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  signup: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUserRole: async (userId, newRole) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole }),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createUser: async (username, password, role) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password, role }),
    });
    return handleResponse(response);
  },
};

// ============================================
// MAKER API
// ============================================
export const makerAPI = {
  extractFields: async (regexPattern, sms) => {
    const response = await fetch(`${API_BASE_URL}/maker/extractFields`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ regexPattern, sms }),
    });
    return handleResponse(response);
  },

  saveDraft: async (patternData) => {
    const response = await fetch(`${API_BASE_URL}/maker/saveDraft`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patternData),
    });
    return handleResponse(response);
  },

  savePending: async (patternData) => {
    const response = await fetch(`${API_BASE_URL}/maker/savePending`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patternData),
    });
    return handleResponse(response);
  },

  getRejected: async () => {
    const response = await fetch(`${API_BASE_URL}/maker/getRejected`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getFailed: async () => {
    const response = await fetch(`${API_BASE_URL}/maker/getFailed`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// CHECKER API
// ============================================
export const checkerAPI = {
  extractFields: async (regexPattern, sms) => {
    const response = await fetch(`${API_BASE_URL}/checker/extractFields`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ regexPattern, sms }),
    });
    return handleResponse(response);
  },

  getPendings: async () => {
    const response = await fetch(`${API_BASE_URL}/checker/getPendings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  approve: async (patternData) => {
    const response = await fetch(`${API_BASE_URL}/checker/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patternData),
    });
    return handleResponse(response);
  },

  reject: async (patternData) => {
    const response = await fetch(`${API_BASE_URL}/checker/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patternData),
    });
    return handleResponse(response);
  },
};

// ============================================
// USER API
// ============================================
export const userAPI = {
  getTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/user/transactions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  findPattern: async (sms, smsTitle) => {
    const response = await fetch(`${API_BASE_URL}/user/findPattern`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sms, smsTitle }),
    });
    return handleResponse(response);
  },
};

// ============================================
// EXPORT ALL
// ============================================
export default {
  auth: authAPI,
  admin: adminAPI,
  maker: makerAPI,
  checker: checkerAPI,
  user: userAPI,
};
