
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

interface UserCommentsProps {
  userId: string;
  isOwnProfile: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  objects: {
    id: string;
    name: string;
  };
}

const UserComments: React.FC<UserCommentsProps> = ({ userId, isOwnProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // Get comments with story information
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            author_name,
            objects:object_id (
              id,
              name
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setComments(data || []);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchComments();
    }
  }, [userId]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      
      // Remove from local state
      setComments(comments.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido com sucesso.",
      });
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o comentário. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="px-4 py-2 border-t">
              <Skeleton className="h-4 w-40" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erro ao carregar comentários: {error}</p>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {isOwnProfile ? 'Você ainda não fez nenhum comentário' : 'Este usuário ainda não fez comentários'}
        </h3>
        
        {isOwnProfile && (
          <Button asChild className="mt-4 bg-connectos-400 hover:bg-connectos-500">
            <Link to="/explore">
              Explorar histórias
            </Link>
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader className="p-4 pb-2">
            <Link 
              to={`/story/${comment.objects.id}`} 
              className="font-medium hover:text-connectos-500 transition-colors"
            >
              {comment.objects.name}
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-gray-700">{comment.content}</p>
          </CardContent>
          <CardFooter className="px-4 py-2 border-t flex justify-between">
            <span className="text-xs text-gray-500">
              {format(new Date(comment.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="text-connectos-500 hover:text-connectos-700 hover:bg-connectos-50"
              >
                <Link to={`/story/${comment.objects.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver
                </Link>
              </Button>
              
              {isOwnProfile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default UserComments;
