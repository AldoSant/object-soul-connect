
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetUserId, 
  onFollowChange,
  variant = 'default',
  size = 'default'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        setCheckingStatus(true);
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error);
        }

        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [user, targetUserId]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: 'Autenticação necessária',
        description: 'Você precisa estar logado para seguir outros usuários.',
        variant: 'destructive',
      });
      return;
    }

    // Don't allow following yourself
    if (user.id === targetUserId) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode seguir a si mesmo.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        toast({
          title: 'Deixou de seguir',
          description: 'Você deixou de seguir este usuário.',
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        toast({
          title: 'Seguindo',
          description: 'Você começou a seguir este usuário.',
        });
      }

      setIsFollowing(!isFollowing);
      if (onFollowChange) onFollowChange();
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === targetUserId) return null;

  if (checkingStatus) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className="min-w-[100px]"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={loading}
      className={isFollowing ? undefined : "bg-connectos-400 hover:bg-connectos-500"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Deixar de seguir
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  );
};

export default FollowButton;
