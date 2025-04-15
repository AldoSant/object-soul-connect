
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, User, MessageSquare, BookOpen, Info, X, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Notification, useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    loading, 
    notifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Redirecionar para auth se não estiver logado
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User size={20} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={20} className="text-green-500" />;
      case 'book':
        return <BookOpen size={20} className="text-purple-500" />;
      case 'info':
        return <Info size={20} className="text-yellow-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    markAsRead(notification.id);
    
    // Navegar para a URL da ação, se existir
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-connectos-500" />
              Notificações
            </h1>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={markAllAsRead}
              >
                <Check size={14} />
                <span>Marcar todas como lidas</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread">Não lidas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <NotificationsList 
                loading={loading} 
                notifications={filteredNotifications} 
                onNotificationClick={handleNotificationClick}
                getNotificationIcon={getNotificationIcon}
              />
            </TabsContent>
            
            <TabsContent value="unread">
              <NotificationsList 
                loading={loading} 
                notifications={filteredNotifications} 
                onNotificationClick={handleNotificationClick}
                getNotificationIcon={getNotificationIcon}
                emptyMessage="Você não tem notificações não lidas"
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface NotificationsListProps {
  loading: boolean;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  emptyMessage?: string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  loading, 
  notifications, 
  onNotificationClick,
  getNotificationIcon,
  emptyMessage = "Você não tem notificações"
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-lg border">
        <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground">
          As notificações aparecerão aqui quando você recebê-las.
        </p>
      </div>
    );
  }
  
  // Agrupar notificações por data
  const groupedNotifications: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey;
    
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Ontem';
    } else {
      dateKey = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    
    if (!groupedNotifications[dateKey]) {
      groupedNotifications[dateKey] = [];
    }
    
    groupedNotifications[dateKey].push(notification);
  });
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([date, notificationsList]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
          <div className="space-y-2">
            {notificationsList.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "bg-card border rounded-lg p-4 hover:bg-muted/40 cursor-pointer transition-colors",
                  !notification.isRead && "bg-muted/30 border-muted-foreground/20"
                )}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.iconType || '')}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={cn("text-base", !notification.isRead && "font-medium")}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <p className="text-xs text-connectos-500 mt-2">
                        Clique para ver detalhes
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="mt-6" />
        </div>
      ))}
    </div>
  );
};

export default Notifications;
