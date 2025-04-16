
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';

export const useFeedContent = (
  user: User | null,
  navigate: NavigateFunction,
  toast: any,
  refreshKey: number
) => {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [myStories, setMyStories] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
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
              isOwnStory: true,
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

  return {
    loading,
    stories,
    myStories
  };
};
