
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Trash2, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

interface CommentsListProps {
  storyId: string;
  refreshTrigger?: number;
}

const CommentsList: React.FC<CommentsListProps> = ({ storyId, refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('object_id', storyId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Erro ao carregar comentários",
          description: "Não foi possível carregar os comentários para esta história.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [storyId, refreshTrigger, toast]);
  
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
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Nenhum comentário ainda</h3>
        <p className="text-gray-500 mt-1">Seja o primeiro a comentar nesta história.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-connectos-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-connectos-700" />
                </div>
                <span className="font-medium">{comment.author_name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-gray-700">{comment.content}</p>
          </CardContent>
          {user && user.id === comment.user_id && (
            <CardFooter className="px-4 py-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteComment(comment.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CommentsList;
