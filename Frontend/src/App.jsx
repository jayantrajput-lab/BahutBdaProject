import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useThemeStore } from "@/stores/themeStore";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import MakerDashboard from "./pages/MakerDashboard";
import CheckerDashboard from "./pages/CheckerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  
  // Initialize theme on app load
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Page */}
          <Route path="/" element={<LoginPage />} />
          
          {/* User Dashboard - Protected for USER role */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Maker Dashboard - Protected for MAKER role */}
          <Route
            path="/maker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MAKER']}>
                <MakerDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Checker Dashboard - Protected for CHECKER role */}
          <Route
            path="/checker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CHECKER']}>
                <CheckerDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard - Protected for ADMIN role */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
