
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import PWAInstallBanner from '@/components/PWAInstallBanner';

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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
