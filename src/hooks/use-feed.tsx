
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definir um tipo para o cache
type FeedCache = {
  stories: any[];
  timestamp: number;
  userId: string;
};

// Cache em memória
let memoryCache: FeedCache | null = null;
const CACHE_DURATION = 60000; // 1 minuto em milissegundos

export const useFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedStories = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Verifique se podemos usar o cache
      const now = Date.now();
      if (
        !forceRefresh && 
        memoryCache && 
        memoryCache.userId === user.id &&
        now - memoryCache.timestamp < CACHE_DURATION
      ) {
        console.log("Usando cache do feed, idade:", (now - memoryCache.timestamp) / 1000, "segundos");
        setStories(memoryCache.stories);
        setLoading(false);
        return;
      }
      
      console.log("Buscando feed do servidor para usuário:", user.id);
      
      // Buscar dados dos usuários seguidos
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

      console.log("Seguindo usuários:", followingIds.length);
      console.log("Seguindo histórias:", followedStoryIds.length);

      // Incluir sempre as histórias do próprio usuário
      console.log("Incluindo histórias do próprio usuário na busca");
      
      // Construir a condição OR
      let orCondition = `user_id.eq.${user.id}`;
      
      if (followingIds.length > 0) {
        orCondition += `,user_id.in.(${followingIds.join(',')})`;
      }
      
      if (followedStoryIds.length > 0) {
        orCondition += `,id.in.(${followedStoryIds.join(',')})`;
      }

      console.log("Condição de busca:", orCondition);

      // Buscar histórias do usuário e de usuários seguidos/histórias seguidas
      const { data: storiesData, error: storiesError } = await supabase
        .from('objects')
        .select('id, name, description, updated_at, is_public, story_type, location, thumbnail, user_id, last_activity_at')
        .or(orCondition)
        .order('last_activity_at', { ascending: false })
        .limit(100); // Aumentamos o limite para suportar paginação no cliente

      if (storiesError) throw storiesError;

      console.log("Histórias buscadas:", storiesData?.length);

      // Buscar informações de perfil e contagem de registros
      const enhancedStories = await Promise.all(
        (storiesData || []).map(async (story) => {
          // Buscar perfil do usuário
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', story.user_id)
            .single();

          // Contar registros
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

      console.log("Histórias processadas:", enhancedStories.length);
      console.log("Histórias do próprio usuário:", enhancedStories.filter(s => s.isOwnStory).length);

      // Atualizar o cache
      memoryCache = {
        stories: enhancedStories,
        timestamp: Date.now(),
        userId: user.id
      };
      
      setStories(enhancedStories);
    } catch (error: any) {
      console.error('Erro ao buscar feed:', error);
      setError(error.message || 'Erro ao carregar histórias');
      toast({
        title: 'Erro ao carregar feed',
        description: error.message || 'Não foi possível carregar as histórias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFeedStories(refreshKey > 0);
  }, [fetchFeedStories, refreshKey]);

  const handleRefresh = () => {
    // Limpar o cache forçando uma atualização
    memoryCache = null;
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: 'Atualizando feed',
      description: 'Buscando as histórias mais recentes...',
    });
  };

  return {
    loading,
    stories,
    error,
    handleRefresh
  };
};
