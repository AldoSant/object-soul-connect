
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, BookOpen } from 'lucide-react';
import StoryCard from './StoryCard';

interface UserStoriesProps {
  userId: string;
  isOwnProfile: boolean;
}

const UserStories: React.FC<UserStoriesProps> = ({ userId, isOwnProfile }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        
        const query = supabase
          .from('objects')
          .select('id, name, description, updated_at, is_public, story_type, location, thumbnail')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (!isOwnProfile) {
          // If not viewing own profile, only show public stories
          query.eq('is_public', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Fetch record counts for each story
        const storiesWithCounts = await Promise.all(
          (data || []).map(async (story) => {
            const { count } = await supabase
              .from('records')
              .select('*', { count: 'exact', head: true })
              .eq('object_id', story.id);
              
            return {
              ...story,
              recordCount: count || 0,
              lastUpdated: format(new Date(story.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            };
          })
        );
        
        setStories(storiesWithCounts);
      } catch (err: any) {
        console.error('Error fetching stories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchStories();
    }
  }, [userId, isOwnProfile]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <Skeleton className="h-32 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar histórias: {error}</p>
      </div>
    );
  }
  
  if (stories.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {isOwnProfile ? 'Você ainda não criou nenhuma história' : 'Este usuário ainda não criou histórias públicas'}
        </h3>
        
        {isOwnProfile && (
          <Button asChild className="mt-4 bg-connectos-400 hover:bg-connectos-500">
            <Link to="/story/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar nova história
            </Link>
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div>
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <Button asChild className="bg-connectos-400 hover:bg-connectos-500">
            <Link to="/story/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova História
            </Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          />
        ))}
      </div>
    </div>
  );
};

export default UserStories;
