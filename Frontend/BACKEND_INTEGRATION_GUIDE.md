# Backend Integration Guide

This guide explains how to integrate your backend API with this React frontend.

## Table of Contents
1. [Setup](#setup)
2. [API Service Layer](#api-service-layer)
3. [Store Integration](#store-integration)
4. [Authentication Flow](#authentication-flow)
5. [Backend API Requirements](#backend-api-requirements)
6. [Example Integration](#example-integration)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Setup

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENV=development
```

For production:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_ENV=production
```

### 2. Install Dependencies (if needed)

The project already uses `fetch` API, but you can optionally use axios:

```bash
npm install axios
```

---

## API Service Layer

The API service is located at `src/services/api.js` and provides organized methods for all backend calls.

### Structure:
```javascript
import api from '@/services/api';

// Authentication
api.auth.login(username, password)
api.auth.signup(username, password, role)
api.auth.logout()

// User Management (Admin)
api.users.getAllUsers()
api.users.updateUserRole(userId, newRole)

// Regex Templates (Maker/Checker)
api.regex.getAllTemplates()
api.regex.saveDraft(templateData)
api.regex.approveTemplate(templateId)

// Transactions (User)
api.transactions.parseSMS(smsText)
api.transactions.saveTransaction(transactionData)
api.transactions.getTransactions()
```

---

## Store Integration

### Step 1: Update Auth Store

Replace the mock implementation in `src/stores/authStore.js`:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/services/api';

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
          const response = await authAPI.login(username, password);
          
          // Store token
          localStorage.setItem('auth-token', response.token);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
        }
      },

      signup: async (username, password, role) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.signup(username, password, role);
          
          localStorage.setItem('auth-token', response.token);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('auth-token');
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Admin functions
      getAllUsers: async () => {
        try {
          const users = await userAPI.getAllUsers();
          return users;
        } catch (error) {
          console.error('Get users error:', error);
          return [];
        }
      },

      updateUserRole: async (userId, newRole) => {
        try {
          await userAPI.updateUserRole(userId, newRole);
          return true;
        } catch (error) {
          console.error('Update role error:', error);
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Step 2: Update Regex Store

Replace `src/stores/regexStore.js`:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { regexAPI } from '@/services/api';

export const useRegexStore = create(
  persist(
    (set, get) => ({
      templates: [],
      currentDraft: null,
      isLoading: false,

      // Fetch all templates
      fetchTemplates: async () => {
        set({ isLoading: true });
        try {
          const templates = await regexAPI.getAllTemplates();
          set({ templates, isLoading: false });
        } catch (error) {
          console.error('Fetch templates error:', error);
          set({ isLoading: false });
        }
      },

      saveDraft: async (template, userId) => {
        try {
          const saved = await regexAPI.saveDraft({
            ...template,
            createdBy: userId,
          });
          
          set(state => ({
            templates: [...state.templates, saved],
          }));
          
          return saved;
        } catch (error) {
          console.error('Save draft error:', error);
          throw error;
        }
      },

      submitForApproval: async (templateId) => {
        try {
          await regexAPI.submitForApproval(templateId);
          
          set(state => ({
            templates: state.templates.map(t =>
              t.id === templateId ? { ...t, status: 'pending' } : t
            ),
          }));
        } catch (error) {
          console.error('Submit error:', error);
          throw error;
        }
      },

      approveTemplate: async (templateId) => {
        try {
          await regexAPI.approveTemplate(templateId);
          
          set(state => ({
            templates: state.templates.map(t =>
              t.id === templateId ? { ...t, status: 'approved' } : t
            ),
          }));
        } catch (error) {
          console.error('Approve error:', error);
          throw error;
        }
      },

      rejectTemplate: async (templateId, reason) => {
        try {
          await regexAPI.rejectTemplate(templateId, reason);
          
          set(state => ({
            templates: state.templates.map(t =>
              t.id === templateId ? { ...t, status: 'rejected' } : t
            ),
          }));
        } catch (error) {
          console.error('Reject error:', error);
          throw error;
        }
      },

      getPendingTemplates: () => {
        return get().templates.filter(t => t.status === 'pending');
      },

      setCurrentDraft: (draft) => set({ currentDraft: draft }),
    }),
    {
      name: 'regex-storage',
    }
  )
);
```

### Step 3: Update Transaction Store

Replace `src/stores/transactionStore.js`:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { transactionAPI } from '@/services/api';

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,

      // Fetch all transactions
      fetchTransactions: async () => {
        set({ isLoading: true });
        try {
          const transactions = await transactionAPI.getTransactions();
          set({ transactions, isLoading: false });
        } catch (error) {
          console.error('Fetch transactions error:', error);
          set({ isLoading: false });
        }
      },

      saveTransaction: async (transactionData, userId) => {
        try {
          const saved = await transactionAPI.saveTransaction({
            ...transactionData,
            userId,
          });
          
          set(state => ({
            transactions: [...state.transactions, saved],
          }));
          
          return saved;
        } catch (error) {
          console.error('Save transaction error:', error);
          throw error;
        }
      },

      getTransactionsByUser: (userId) => {
        return get().transactions.filter(t => t.userId === userId);
      },

      getTransactionsByType: (userId, type) => {
        return get().transactions.filter(
          t => t.userId === userId && t.type === type
        );
      },

      deleteTransaction: async (transactionId) => {
        try {
          await transactionAPI.deleteTransaction(transactionId);
          
          set(state => ({
            transactions: state.transactions.filter(t => t.id !== transactionId),
          }));
        } catch (error) {
          console.error('Delete transaction error:', error);
          throw error;
        }
      },

      clearAllTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);
```

---

## Backend API Requirements

Your backend should implement these endpoints:

### Authentication Endpoints

```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/logout
GET    /api/auth/me
```

**Request/Response Examples:**

```javascript
// POST /api/auth/login
Request: { username: "user", password: "pass123" }
Response: { 
  token: "jwt-token-here",
  user: { id: "123", username: "user", role: "USER" }
}

// GET /api/auth/me
Headers: { Authorization: "Bearer jwt-token" }
Response: { id: "123", username: "user", role: "USER" }
```

### User Management Endpoints (Admin)

```
GET    /api/users
PUT    /api/users/:userId/role
DELETE /api/users/:userId
```

### Regex Template Endpoints

```
GET    /api/templates
GET    /api/templates?status=pending
GET    /api/templates/pending
POST   /api/templates/draft
PUT    /api/templates/:id
POST   /api/templates/:id/submit
POST   /api/templates/:id/approve
POST   /api/templates/:id/reject
DELETE /api/templates/:id
```

### Transaction Endpoints

```
POST   /api/transactions/parse
POST   /api/transactions
GET    /api/transactions
GET    /api/transactions?type=DEBIT
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

---

## Example Integration

### Example 1: Login Component

```javascript
import { useAuthStore } from '@/stores/authStore';

const LoginComponent = () => {
  const { login, isLoading, error } = useAuthStore();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
    // Navigation handled by store
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
      {error && <p>{error}</p>}
      <button disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};
```

### Example 2: Fetching Data on Component Mount

```javascript
import { useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';

const TransactionList = () => {
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {transactions.map(t => (
        <div key={t.id}>{t.amount}</div>
      ))}
    </div>
  );
};
```

---

## Error Handling

### Global Error Interceptor

Create `src/services/errorHandler.js`:

```javascript
export const handleAPIError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('auth-token');
    window.location.href = '/';
  } else if (error.message.includes('403')) {
    // Forbidden
    console.error('Access denied');
  } else if (error.message.includes('500')) {
    // Server error
    console.error('Server error');
  }
  
  return error.message;
};
```

Use in stores:

```javascript
try {
  await api.auth.login(username, password);
} catch (error) {
  const message = handleAPIError(error);
  set({ error: message });
}
```

---

## Testing

### Test Backend Connection

Create `src/services/healthCheck.js`:

```javascript
import { API_BASE_URL } from './api';

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend not reachable:', error);
    return false;
  }
};
```

### Test in Browser Console

```javascript
// Test login
import api from './services/api';
await api.auth.login('admin', 'admin123');

// Test get users
const users = await api.users.getAllUsers();
console.log(users);
```

---

## CORS Configuration

Your backend needs to allow CORS. Example for Express.js:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Next Steps

1. ✅ Create `.env` file with your backend URL
2. ✅ Update stores to use API service
3. ✅ Implement backend endpoints matching the API requirements
4. ✅ Test authentication flow
5. ✅ Test each feature (templates, transactions, users)
6. ✅ Add error handling and loading states
7. ✅ Deploy and configure production URLs

---

## Quick Start Checklist

- [ ] Backend API is running
- [ ] `.env` file created with correct API URL
- [ ] CORS configured on backend
- [ ] JWT authentication implemented
- [ ] All required endpoints implemented
- [ ] Stores updated to use API service
- [ ] Test login/signup flow
- [ ] Test each dashboard functionality

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running and accessible
4. Check CORS configuration
5. Verify JWT token is being sent in headers
