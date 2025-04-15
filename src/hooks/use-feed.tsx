
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchFeedStories = async () => {
      try {
        setLoading(true);
        console.log("Fetching feed for user:", user.id);

        // Get all profiles the user is following
        const { data: followingData, error: followingError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followingError) throw followingError;

        // Fetch directly followed stories
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

        console.log("Following users:", followingIds.length);
        console.log("Following stories:", followedStoryIds.length);

        // Incluir sempre as histórias do próprio usuário
        console.log("Including user's own stories in feed query");
        
        // Construct the OR query condition
        let orCondition = `user_id.eq.${user.id}`;
        
        if (followingIds.length > 0) {
          orCondition += `,user_id.in.(${followingIds.join(',')})`;
        }
        
        if (followedStoryIds.length > 0) {
          orCondition += `,id.in.(${followedStoryIds.join(',')})`;
        }

        console.log("Query condition:", orCondition);

        // Fetch user's own stories and stories from followed users/directly followed stories
        const { data: storiesData, error: storiesError } = await supabase
          .from('objects')
          .select('id, name, description, updated_at, is_public, story_type, location, thumbnail, user_id, last_activity_at')
          .or(orCondition)
          .order('last_activity_at', { ascending: false })
          .limit(50);

        if (storiesError) throw storiesError;

        console.log("Feed stories fetched:", storiesData?.length);
        console.log("User stories in feed (initial check):", storiesData?.filter(s => s.user_id === user.id).length);

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

            const isOwnStory = story.user_id === user.id;

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
              ),
              isOwnStory: isOwnStory
            };
          })
        );

        console.log("Enhanced stories:", enhancedStories.length);
        console.log("User's own stories (after processing):", enhancedStories.filter(s => s.isOwnStory).length);
        console.log("User's own stories:", enhancedStories.filter(s => s.isOwnStory).map(s => s.name));

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

    fetchFeedStories();
  }, [user, toast, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    loading,
    stories,
    handleRefresh
  };
};
