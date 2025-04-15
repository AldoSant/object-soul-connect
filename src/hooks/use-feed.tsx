
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

        // Build query for user's own stories, followed users' stories, and directly followed stories
        let conditions = [];
        
        // Always include user's own stories
        conditions.push(`user_id.eq.${user.id}`);
        
        // Include stories from followed users
        if (followingIds.length > 0) {
          conditions.push(`user_id.in.(${followingIds.join(',')})`);
        }
        
        // Include directly followed stories
        if (followedStoryIds.length > 0) {
          conditions.push(`id.in.(${followedStoryIds.join(',')})`);
        }
        
        // Define query conditions
        const query = supabase
          .from('objects')
          .select('id, name, description, updated_at, is_public, story_type, location, thumbnail, user_id, last_activity_at')
          .eq('is_public', true)
          .or(conditions.join(','))
          .order('last_activity_at', { ascending: false })
          .limit(50);

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
              ),
              isOwnStory: story.user_id === user.id
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
