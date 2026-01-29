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
 * Split-screen layout with image and form
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
    <div className="min-h-screen flex">
      {/* Left Side - Image with Tagline (65% width) */}
      <div className="hidden lg:flex lg:w-[65%] relative bg-primary/5">
        {/* Background Image */}
        <img 
          src="/mannHaitoMoneyhai.jpg" 
          alt="Mann hai toh Money hai" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Tagline Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h1 className="text-5xl font-bold leading-tight">
            Mann hai
            <br />
            <span className="text-primary-foreground/90">toh Money hai</span>
          </h1>
        </div>

        {/* Logo on Image Side */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <img src="/logo.png" alt="Moneyview" className="h-10 w-10" />
          <span className="text-white text-xl font-bold">Moneyview</span>
        </div>
      </div>

      {/* Right Side - Login Form (35% width) */}
      <div className="w-full lg:w-[35%] flex items-center justify-center lg:justify-start lg:pl-8 bg-background p-4 relative">
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

        {/* Mobile Logo - Only visible on small screens */}
        <div className="absolute top-4 left-4 flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="Moneyview" className="h-8 w-8" />
          <span className="text-lg font-bold text-primary">Moneyview</span>
        </div>

        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="text-center pb-2">
            {/* Logo for larger screens in form */}
            <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <img src="/logo.png" alt="Moneyview" className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? 'Sign in to access your financial dashboard' 
                : 'Join Moneyview to start tracking your finances'
              }
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

            {/* Mobile Tagline - Only visible on small screens */}
            <div className="mt-8 pt-6 border-t text-center lg:hidden">
              <p className="text-2xl font-bold text-primary">
                Mann hai toh Money hai
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your SMS, Your Insights
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          © 2026 Moneyview
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
