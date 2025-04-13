
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Lock, MapPin, Tag, Heart } from 'lucide-react';
import { StoryType } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

interface StoryCardProps {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  isPublic: boolean;
  recordCount: number;
  storyType?: StoryType;
  location?: { city?: string; state?: string; country?: string };
  thumbnailUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  authorId?: string;
}

const storyTypeLabels: Record<StoryType, string> = {
  'objeto': 'Objeto',
  'pessoa': 'Pessoa', 
  'espaço': 'Espaço',
  'evento': 'Evento',
  'outro': 'Outro'
};

const StoryCard: React.FC<StoryCardProps> = ({
  id,
  name,
  description,
  lastUpdated,
  isPublic,
  recordCount,
  storyType = 'objeto',
  location,
  thumbnailUrl,
  authorName,
  authorAvatar,
  authorId
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && authorId) {
      checkIfFollowingStory();
    }
  }, [user, authorId, id]);

  const checkIfFollowingStory = async () => {
    if (!user || !authorId) return;
    
    try {
      // Check if following the story specifically
      const { data: storyFollow, error: storyError } = await supabase
        .from('story_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('story_id', id)
        .maybeSingle();
        
      if (storyFollow) {
        setIsFollowing(true);
        return;
      }
      
      // Check if following the user
      const { data: userFollow, error: userError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', authorId)
        .maybeSingle();
        
      setIsFollowing(!!userFollow);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowStory = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Autenticação necessária',
        description: 'Você precisa estar logado para seguir histórias.',
        variant: 'destructive',
      });
      return;
    }
    
    if (user.id === authorId) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode seguir suas próprias histórias.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow story
        const { error: storyError } = await supabase
          .from('story_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('story_id', id);
          
        if (storyError) throw storyError;
        
        toast({
          title: 'Deixou de seguir',
          description: 'Você deixou de seguir esta história.',
        });
      } else {
        // Follow story
        const { error: storyError } = await supabase
          .from('story_follows')
          .insert({
            follower_id: user.id,
            story_id: id
          });
          
        if (storyError) throw storyError;
        
        toast({
          title: 'Seguindo',
          description: 'Você começou a seguir esta história.',
        });
      }
      
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error('Error toggling story follow:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full relative">
      <Link to={`/story/${id}`} className="block h-full">
        <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
          {thumbnailUrl && (
            <div className="h-32 overflow-hidden">
              <img 
                src={thumbnailUrl} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className={`${thumbnailUrl ? 'pt-4' : 'pt-6'}`}>
            {authorName && authorId && (
              <div className="flex items-center gap-2 mb-3">
                <Link 
                  to={`/profile/${authorId}`} 
                  className="flex items-center gap-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className="text-xs bg-connectos-100 text-connectos-700">
                      {authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground truncate">{authorName}</span>
                </Link>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
              {isPublic ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe size={12} />
                  <span>Público</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock size={12} />
                  <span>Privado</span>
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{description}</p>
            
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {storyType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag size={10} />
                  <span>{storyTypeLabels[storyType] || storyType}</span>
                </Badge>
              )}
              
              {location && (location.city || location.state || location.country) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin size={10} />
                  <span className="truncate max-w-[140px]">
                    {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                  </span>
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between text-xs text-muted-foreground">
            <span>Último registro: {lastUpdated}</span>
            <span>{recordCount} registros</span>
          </CardFooter>
        </Card>
      </Link>

      {user && authorId && user.id !== authorId && (
        <Button
          size="sm"
          variant={isFollowing ? "secondary" : "outline"}
          className={`absolute top-2 right-2 rounded-full p-2 h-8 w-8 ${!thumbnailUrl ? 'bg-white shadow-sm' : ''}`}
          onClick={handleFollowStory}
          disabled={loading}
        >
          <Heart size={16} className={isFollowing ? "fill-connectos-500 text-connectos-500" : ""} />
          <span className="sr-only">{isFollowing ? 'Deixar de seguir' : 'Seguir'}</span>
        </Button>
      )}
    </div>
  );
};

export default StoryCard;
