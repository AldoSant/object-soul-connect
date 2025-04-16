
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import { SearchProvider } from '@/hooks/use-search';
import OnboardingTour from '@/components/OnboardingTour';
import ManifestoTouch from '@/components/ManifestoTouch';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Feed from '@/pages/Feed';
import Explore from '@/pages/Explore';
import Profile from '@/pages/Profile';
import NewStory from '@/pages/NewStory';
import StoryDetail from '@/pages/StoryDetail';
import NewObject from '@/pages/NewObject';
import ObjectDetail from '@/pages/ObjectDetail';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Notifications from '@/pages/Notifications';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Determinar em qual página estamos para o ManifestoTouch
  const [currentLocation, setCurrentLocation] = React.useState<'feed' | 'story' | 'object' | 'profile'>('feed');
  
  React.useEffect(() => {
    const updateLocation = () => {
      const path = window.location.pathname;
      if (path.includes('/feed') || path.includes('/home')) {
        setCurrentLocation('feed');
      } else if (path.includes('/story')) {
        setCurrentLocation('story');
      } else if (path.includes('/object')) {
        setCurrentLocation('object');
      } else if (path.includes('/profile')) {
        setCurrentLocation('profile');
      }
    };
    
    updateLocation();
    window.addEventListener('popstate', updateLocation);
    
    return () => {
      window.removeEventListener('popstate', updateLocation);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/story/new" element={<NewStory />} />
              <Route path="/story/:id" element={<StoryDetail />} />
              <Route path="/story/:id/object/new" element={<NewObject />} />
              <Route path="/object/:id" element={<ObjectDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <PWAInstallBanner />
            <OnboardingTour />
            <ManifestoTouch location={currentLocation} />
          </Router>
        </SearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
