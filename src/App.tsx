
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import StoryDetail from "./pages/StoryDetail";
import NewStory from "./pages/NewStory";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import PWAInstallBanner from "./components/PWAInstallBanner";
import MobileNav from "./components/MobileNav";
import { useIsMobile } from "./hooks/use-mobile";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Component to redirect authenticated users to home
const RedirectAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route 
      path="/" 
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } 
    />
    <Route path="/auth" element={<RedirectAuthenticated><Auth /></RedirectAuthenticated>} />
    <Route path="/story/:id" element={<StoryDetail />} />
    <Route 
      path="/story/new" 
      element={
        <ProtectedRoute>
          <NewStory />
        </ProtectedRoute>
      } 
    />
    <Route path="/explore" element={<Explore />} />
    
    {/* Redirect feed route to home */}
    <Route path="/feed" element={<Navigate to="/" replace />} />
    
    {/* Profile routes */}
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } 
    />
    <Route path="/profile/:id" element={<Profile />} />
    
    {/* Legacy routes for backward compatibility */}
    <Route path="/object/:id" element={<StoryDetail />} />
    <Route 
      path="/object/new" 
      element={
        <ProtectedRoute>
          <NewStory />
        </ProtectedRoute>
      } 
    />
    
    {/* Handle non-protected index route */}
    <Route path="/index" element={<RedirectAuthenticated><Index /></RedirectAuthenticated>} />
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AppContent = () => {
  const isMobile = useIsMobile();
  
  return (
    <>
      <AppRoutes />
      <PWAInstallBanner />
      {isMobile && <MobileNav />}
      {isMobile && <div className="pb-16" />} {/* Add padding at the bottom when mobile nav is visible */}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
