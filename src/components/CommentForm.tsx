
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface CommentFormProps {
  storyId: string;
  onSuccess: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ storyId, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, digite seu comentário.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user && !authorName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu nome para comentar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          object_id: storyId,
          user_id: user?.id || null,
          author_name: user ? (user.user_metadata.full_name || user.email) : authorName,
          content: content.trim()
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi publicado com sucesso.",
      });
      
      setContent('');
      if (!user) setAuthorName('');
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível publicar seu comentário. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="comment">Deixe seu comentário</Label>
        <Textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compartilhe seus pensamentos sobre esta história..."
          rows={3}
          disabled={isSubmitting}
          className="mt-1"
        />
      </div>
      
      {!user && (
        <div>
          <Label htmlFor="author-name">Seu nome</Label>
          <Input
            id="author-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Digite seu nome"
            disabled={isSubmitting}
            className="mt-1"
          />
        </div>
      )}
      
      <Button 
        type="submit" 
        className="bg-connectos-400 hover:bg-connectos-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Publicando..." : "Publicar comentário"}
      </Button>
    </form>
  );
};

export default CommentForm;
