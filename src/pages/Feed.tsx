
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeed } from '@/hooks/use-feed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedStoriesList from '@/components/FeedStoriesList';
import FollowSuggestions from '@/components/FollowSuggestions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, User } from 'lucide-react';

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, stories, handleRefresh } = useFeed();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  console.log("Total stories in feed:", stories.length);
  console.log("User's own stories:", stories.filter(s => s.isOwnStory).length);
  console.log("User's own stories:", stories.filter(s => s.isOwnStory).map(s => s.name));

  // Separate user's own stories
  const userStories = stories.filter(s => s.isOwnStory);
  const followedStories = stories.filter(s => !s.isOwnStory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-connectos-500" />
              Seu Feed
            </h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Atualizar</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Feed Completo</TabsTrigger>
                  <TabsTrigger value="mine">
                    <User size={14} className="mr-1" />
                    Minhas Histórias
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <FeedStoriesList loading={loading} stories={stories} />
                </TabsContent>
                
                <TabsContent value="mine">
                  <FeedStoriesList 
                    loading={loading} 
                    stories={userStories}
                    emptyMessage="Você ainda não criou nenhuma história"
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="order-first md:order-last mb-6 md:mb-0">
              <FollowSuggestions onFollow={handleRefresh} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
