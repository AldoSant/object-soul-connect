
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FollowButton from './FollowButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface FollowSuggestionsProps {
  onFollow?: () => void;
  limit?: number;
}

const FollowSuggestions: React.FC<FollowSuggestionsProps> = ({ 
  onFollow,
  limit = 5
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get users that the current user is already following
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = followingData?.map(f => f.following_id) || [];
        // Add current user's ID to exclude from suggestions
        followingIds.push(user.id);

        // Get user suggestions
        const { data: profilesData, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .not('id', 'in', `(${followingIds.join(',')})`)
          .limit(limit);

        if (error) throw error;

        // Check how many stories each user has
        const suggestionsWithCounts = await Promise.all(
          (profilesData || []).map(async (profile) => {
            const { count } = await supabase
              .from('objects')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('is_public', true);

            return {
              ...profile,
              storyCount: count || 0
            };
          })
        );

        // Sort by number of stories (users with more stories first)
        const sortedSuggestions = suggestionsWithCounts
          .sort((a, b) => b.storyCount - a.storyCount)
          .filter(profile => profile.storyCount > 0); // Only show users with at least one story

        setSuggestions(sortedSuggestions);
      } catch (error) {
        console.error('Error fetching follow suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user, limit]);

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-connectos-500" />
          Sugestões para seguir
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between">
                <Link 
                  to={`/profile/${profile.id}`} 
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar>
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-connectos-100 text-connectos-700">
                      {profile.full_name?.[0] || profile.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {profile.full_name || profile.username || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.storyCount} {profile.storyCount === 1 ? 'história' : 'histórias'}
                    </p>
                  </div>
                </Link>
                <FollowButton 
                  targetUserId={profile.id} 
                  onFollowChange={onFollow}
                  size="sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma sugestão disponível no momento.
            </p>
            <Button 
              variant="link" 
              asChild 
              className="mt-1 text-connectos-500 hover:text-connectos-600"
            >
              <Link to="/explore">Explorar mais histórias</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowSuggestions;
