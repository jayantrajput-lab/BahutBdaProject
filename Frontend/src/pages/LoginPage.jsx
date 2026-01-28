import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

/**
 * LoginPage - Authentication page with login/signup functionality
 * Redirects to appropriate dashboard based on role after auth
 */
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, signup, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const roleRoutes = {
      ADMIN: '/admin/dashboard',
      USER: '/user/dashboard',
      MAKER: '/maker/dashboard',
      CHECKER: '/checker/dashboard',
    };
    navigate(roleRoutes[user.role], { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!username.trim() || !password.trim()) {
      return;
    }

    if (isLogin) {
      await login(username, password);
    } else {
      await signup(username, password);
    }

    // Get updated state after auth
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user) {
      const roleRoutes = {
        ADMIN: '/admin/dashboard',
        USER: '/user/dashboard',
        MAKER: '/maker/dashboard',
        CHECKER: '/checker/dashboard',
      };
      navigate(roleRoutes[state.user.role]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative">
      {/* Theme Toggle - Top Right */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 h-10 w-10"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>

      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/logo.png" alt="Moneyview" className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Moneyview</CardTitle>
          <CardDescription className="text-base">
            Fintech SMS-to-Ledger Engine
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="h-11"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-11"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                clearError();
              }}
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="underline font-medium">
                {isLogin ? 'Sign up' : 'Login'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Decorative elements */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        © 2026 Moneyview
      </div>
    </div>
  );
};

export default LoginPage;
