
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryCard from '@/components/StoryCard';
import FollowSuggestions from '@/components/FollowSuggestions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Users, User } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('following');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchFeedStories = async () => {
      try {
        setLoading(true);

        // Get all profiles the user is following
        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followingError) throw followingError;

        // Buscar histórias seguidas diretamente
        const { data: followedStories, error: followedStoriesError } = await supabase
          .from('story_follows')
          .select('story_id')
          .eq('follower_id', user.id);
          
        if (followedStoriesError) throw followedStoriesError;
        
        let followingIds: string[] = [];
        if (followingData && followingData.length > 0) {
          followingIds = followingData.map(follow => follow.following_id);
        }
        
        let followedStoryIds: string[] = [];
        if (followedStories && followedStories.length > 0) {
          followedStoryIds = followedStories.map(follow => follow.story_id);
        }

        if (followingIds.length === 0 && followedStoryIds.length === 0) {
          setStories([]);
          setLoading(false);
          return;
        }

        // Get stories from followed users and/or directly followed stories
        const query = supabase
          .from('objects')
          .select('id, name, description, updated_at, is_public, story_type, location, thumbnail, user_id, last_activity_at')
          .eq('is_public', true)
          .order('last_activity_at', { ascending: false })
          .limit(20);
          
        if (followingIds.length > 0) {
          if (followedStoryIds.length > 0) {
            // Combinar usuários seguidos e histórias seguidas
            query.or(`user_id.in.(${followingIds.join(',')}),id.in.(${followedStoryIds.join(',')})`);
          } else {
            // Apenas usuários seguidos
            query.in('user_id', followingIds);
          }
        } else if (followedStoryIds.length > 0) {
          // Apenas histórias seguidas
          query.in('id', followedStoryIds);
        }
        
        const { data: storiesData, error: storiesError } = await query;

        if (storiesError) throw storiesError;

        // Get profile info and record count for each story
        const enhancedStories = await Promise.all(
          (storiesData || []).map(async (story) => {
            // Get user profile info
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, username, avatar_url')
              .eq('id', story.user_id)
              .single();

            // Get record count
            const { count } = await supabase
              .from('records')
              .select('*', { count: 'exact', head: true })
              .eq('object_id', story.id);

            return {
              ...story,
              authorName: profileData?.full_name || profileData?.username || 'Usuário',
              authorAvatar: profileData?.avatar_url,
              authorId: story.user_id,
              recordCount: count || 0,
              lastUpdated: format(
                new Date(story.last_activity_at || story.updated_at), 
                "dd 'de' MMMM 'de' yyyy", 
                { locale: ptBR }
              )
            };
          })
        );

        setStories(enhancedStories);
      } catch (error: any) {
        console.error('Error fetching feed:', error);
        toast({
          title: 'Erro ao carregar feed',
          description: error.message || 'Não foi possível carregar as histórias',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchMyStories = async () => {
      try {
        setLoading(true);
        
        // Get the current user's stories
        const { data: myStoriesData, error: myStoriesError } = await supabase
          .from('objects')
          .select('id, name, description, updated_at, is_public, story_type, location, thumbnail, user_id, last_activity_at')
          .eq('user_id', user.id)
          .order('last_activity_at', { ascending: false })
          .limit(20);
        
        if (myStoriesError) throw myStoriesError;
        
        if (!myStoriesData || myStoriesData.length === 0) {
          setMyStories([]);
          return;
        }
        
        // Get record count for each story
        const enhancedMyStories = await Promise.all(
          myStoriesData.map(async (story) => {
            // Get user profile info
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, username, avatar_url')
              .eq('id', user.id)
              .single();
              
            // Get record count
            const { count } = await supabase
              .from('records')
              .select('*', { count: 'exact', head: true })
              .eq('object_id', story.id);
              
            return {
              ...story,
              authorName: profileData?.full_name || profileData?.username || 'Usuário',
              authorAvatar: profileData?.avatar_url,
              authorId: story.user_id,
              recordCount: count || 0,
              lastUpdated: format(
                new Date(story.last_activity_at || story.updated_at),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR }
              )
            };
          })
        );
        
        setMyStories(enhancedMyStories);
      } catch (error: any) {
        console.error('Error fetching user stories:', error);
        toast({
          title: 'Erro ao carregar suas histórias',
          description: error.message || 'Não foi possível carregar suas histórias',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedStories();
    fetchMyStories();
  }, [user, navigate, toast, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Home className="h-6 w-6 text-connectos-500" />
              Início
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
              <Tabs 
                defaultValue="following" 
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="following">Seguindo</TabsTrigger>
                  <TabsTrigger value="mystories">Minhas Histórias</TabsTrigger>
                </TabsList>
                
                <TabsContent value="following">
                  {loading && activeTab === "following" ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[200px] w-full" />
                      ))}
                    </div>
                  ) : stories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {stories.map((story) => (
                        <StoryCard
                          key={story.id}
                          id={story.id}
                          name={story.name}
                          description={story.description || ''}
                          lastUpdated={story.lastUpdated}
                          isPublic={story.is_public}
                          recordCount={story.recordCount}
                          storyType={story.story_type}
                          location={story.location}
                          thumbnailUrl={story.thumbnail}
                          authorName={story.authorName}
                          authorAvatar={story.authorAvatar}
                          authorId={story.authorId}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Seu feed está vazio</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece seguindo outros usuários para ver suas histórias aqui.
                      </p>
                      <Button 
                        variant="default" 
                        onClick={() => navigate('/explore')}
                        className="bg-connectos-400 hover:bg-connectos-500"
                      >
                        Explorar histórias
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="mystories">
                  {loading && activeTab === "mystories" ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[200px] w-full" />
                      ))}
                    </div>
                  ) : myStories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {myStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          id={story.id}
                          name={story.name}
                          description={story.description || ''}
                          lastUpdated={story.lastUpdated}
                          isPublic={story.is_public}
                          recordCount={story.recordCount}
                          storyType={story.story_type}
                          location={story.location}
                          thumbnailUrl={story.thumbnail}
                          authorName={story.authorName}
                          authorAvatar={story.authorAvatar}
                          authorId={story.authorId}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Você ainda não criou histórias</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie sua primeira história para começar a registrar suas memórias digitais.
                      </p>
                      <Button 
                        variant="default" 
                        onClick={() => navigate('/story/new')}
                        className="bg-connectos-400 hover:bg-connectos-500"
                      >
                        Criar história
                      </Button>
                    </div>
                  )}
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

export default Home;
