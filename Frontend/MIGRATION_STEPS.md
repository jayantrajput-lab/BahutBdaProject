# Quick Migration Steps: Mock to Real Backend

Follow these steps to migrate from mock data to your real backend API.

## Step 1: Environment Setup (2 minutes)

```bash
# Create .env file
cp .env.example .env

# Edit .env and set your backend URL
# VITE_API_BASE_URL=http://localhost:8080/api
```

## Step 2: Update Auth Store (5 minutes)

Replace the content of `src/stores/authStore.js` with:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

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
          const response = await api.auth.login(username, password);
          localStorage.setItem('auth-token', response.token);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      signup: async (username, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.signup(username, password, role);
          localStorage.setItem('auth-token', response.token);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('auth-token');
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      getAllUsers: async () => {
        try {
          return await api.users.getAllUsers();
        } catch (error) {
          console.error('Get users error:', error);
          return [];
        }
      },

      updateUserRole: async (userId, newRole) => {
        try {
          await api.users.updateUserRole(userId, newRole);
          return true;
        } catch (error) {
          console.error('Update role error:', error);
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

## Step 3: Update Regex Store (5 minutes)

Replace the content of `src/stores/regexStore.js` with:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

export const useRegexStore = create(
  persist(
    (set, get) => ({
      templates: [],
      currentDraft: null,
      isLoading: false,

      fetchTemplates: async () => {
        set({ isLoading: true });
        try {
          const templates = await api.regex.getAllTemplates();
          set({ templates, isLoading: false });
        } catch (error) {
          console.error('Fetch templates error:', error);
          set({ isLoading: false });
        }
      },

      saveDraft: async (template, userId) => {
        try {
          const saved = await api.regex.saveDraft({ ...template, createdBy: userId });
          set(state => ({ templates: [...state.templates, saved] }));
          return saved;
        } catch (error) {
          console.error('Save draft error:', error);
          throw error;
        }
      },

      submitForApproval: async (templateId) => {
        try {
          await api.regex.submitForApproval(templateId);
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
          await api.regex.approveTemplate(templateId);
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
          await api.regex.rejectTemplate(templateId, reason);
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

      getPendingTemplates: () => get().templates.filter(t => t.status === 'pending'),
      setCurrentDraft: (draft) => set({ currentDraft: draft }),
    }),
    { name: 'regex-storage' }
  )
);
```

## Step 4: Update Transaction Store (5 minutes)

Replace the content of `src/stores/transactionStore.js` with:

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,

      fetchTransactions: async () => {
        set({ isLoading: true });
        try {
          const transactions = await api.transactions.getTransactions();
          set({ transactions, isLoading: false });
        } catch (error) {
          console.error('Fetch transactions error:', error);
          set({ isLoading: false });
        }
      },

      saveTransaction: async (transactionData, userId) => {
        try {
          const saved = await api.transactions.saveTransaction({
            ...transactionData,
            userId,
          });
          set(state => ({ transactions: [...state.transactions, saved] }));
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
          await api.transactions.deleteTransaction(transactionId);
          set(state => ({
            transactions: state.transactions.filter(t => t.id !== transactionId),
          }));
        } catch (error) {
          console.error('Delete transaction error:', error);
          throw error;
        }
      },

      clearAllTransactions: () => set({ transactions: [] }),
    }),
    { name: 'transaction-storage' }
  )
);
```

## Step 5: Update Components to Fetch Data (10 minutes)

### Update AdminDashboard.jsx

Add this to the component:

```javascript
const { getAllUsers } = useAuthStore();
const [users, setUsers] = useState([]);

useEffect(() => {
  loadUsers();
}, []);

const loadUsers = async () => {
  const allUsers = await getAllUsers();
  setUsers(allUsers);
};
```

### Update MakerDashboard.jsx

Add this to the component:

```javascript
const { fetchTemplates } = useRegexStore();

useEffect(() => {
  fetchTemplates();
}, []);
```

### Update CheckerDashboard.jsx

Add this to the component:

```javascript
const { fetchTemplates } = useRegexStore();

useEffect(() => {
  fetchTemplates();
}, []);
```

### Update UserDashboard.jsx

Add this to the component:

```javascript
const { fetchTransactions } = useTransactionStore();

useEffect(() => {
  fetchTransactions();
}, []);
```

## Step 6: Test the Integration (5 minutes)

1. Start your backend server
2. Start the frontend: `npm run dev`
3. Open browser console (F12)
4. Try logging in
5. Check Network tab for API calls
6. Verify data is loading from backend

## Common Issues & Solutions

### Issue 1: CORS Error
**Solution:** Add CORS middleware to your backend

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: 401 Unauthorized
**Solution:** Check if JWT token is being sent in headers

```javascript
// In browser console
console.log(localStorage.getItem('auth-token'));
```

### Issue 3: Network Error
**Solution:** Verify backend URL in .env file

```bash
# Check if backend is running
curl http://localhost:8080/api/health
```

### Issue 4: Data Not Loading
**Solution:** Check if fetchData is called in useEffect

```javascript
useEffect(() => {
  fetchTransactions();
}, []);
```

## Rollback to Mock Data

If you need to rollback, the original mock implementations are in:
- Git history
- Or keep backup files with `.backup` extension

## Testing Checklist

- [ ] Login works
- [ ] Signup works
- [ ] Admin can see users
- [ ] Admin can change roles
- [ ] Maker can create templates
- [ ] Checker can approve/reject
- [ ] User can save transactions
- [ ] User can filter transactions
- [ ] Logout works

## Performance Tips

1. **Add Loading States:**
```javascript
{isLoading ? <Spinner /> : <DataDisplay />}
```

2. **Add Error Boundaries:**
```javascript
{error && <ErrorMessage message={error} />}
```

3. **Debounce API Calls:**
```javascript
import { debounce } from 'lodash';
const debouncedSearch = debounce(searchAPI, 300);
```

## Next Steps After Migration

1. Add pagination for large datasets
2. Implement real-time updates (WebSocket)
3. Add caching strategy
4. Implement retry logic for failed requests
5. Add request cancellation for unmounted components

---

**Estimated Total Time: 30-40 minutes**

Good luck with your integration! 🚀
