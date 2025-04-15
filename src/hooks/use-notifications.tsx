
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type Notification = {
  id: string;
  type: 'follow' | 'story_update' | 'comment' | 'like' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  created_at: string;
  relativeTime: string;
  actionUrl?: string;
  iconType?: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulando notificações para este exemplo
  // Em uma implementação real, isso buscaria de uma tabela no banco de dados
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Esta é uma simulação - em uma implementação real, buscaríamos do banco
      // Aguardar um tempo para simular a rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const twoDays = 2 * oneDay;
      const threeDays = 3 * oneDay;
      
      // Notificações simuladas
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'follow',
          title: 'Novo seguidor',
          message: 'Maria Silva começou a seguir você',
          isRead: false,
          created_at: new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString(),
          relativeTime: formatDistanceToNow(new Date(now.getTime() - (2 * 60 * 60 * 1000)), { locale: ptBR, addSuffix: true }),
          actionUrl: '/profile/user123',
          iconType: 'user'
        },
        {
          id: '2',
          type: 'story_update',
          title: 'História atualizada',
          message: 'A história "Memórias de uma Cadeira Centenária" foi atualizada com 3 novos registros',
          isRead: true,
          created_at: new Date(now.getTime() - oneDay).toISOString(),
          relativeTime: formatDistanceToNow(new Date(now.getTime() - oneDay), { locale: ptBR, addSuffix: true }),
          actionUrl: '/story/story123',
          iconType: 'book'
        },
        {
          id: '3',
          type: 'comment',
          title: 'Novo comentário',
          message: 'João Pereira comentou em sua história "Mesa de Jantar Restaurada"',
          isRead: false,
          created_at: new Date(now.getTime() - twoDays).toISOString(),
          relativeTime: formatDistanceToNow(new Date(now.getTime() - twoDays), { locale: ptBR, addSuffix: true }),
          actionUrl: '/story/story456#comments',
          iconType: 'message'
        },
        {
          id: '4',
          type: 'system',
          title: 'Bem-vindo ao ConnectOS',
          message: 'Obrigado por se juntar à nossa comunidade. Comece agora sua jornada digital!',
          isRead: true,
          created_at: new Date(now.getTime() - threeDays).toISOString(),
          relativeTime: formatDistanceToNow(new Date(now.getTime() - threeDays), { locale: ptBR, addSuffix: true }),
          iconType: 'info'
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: 'Erro ao carregar notificações',
        description: error.message || 'Não foi possível carregar suas notificações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, refreshKey]);

  // Marcar notificação como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Em uma implementação real, atualizaríamos no banco de dados também
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    setUnreadCount(0);
    
    // Em uma implementação real, atualizaríamos no banco de dados também
    toast({
      title: 'Notificações',
      description: 'Todas as notificações foram marcadas como lidas',
    });
  }, [toast]);

  // Atualizar notificações
  const refreshNotifications = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    loading,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
};
