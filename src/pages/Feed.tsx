
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeed } from '@/hooks/use-feed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeedStoriesList from '@/components/FeedStoriesList';
import FollowSuggestions from '@/components/FollowSuggestions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, Users, User, Filter, Search, 
  List, LayoutGrid, Clock, Star, Calendar 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, stories, handleRefresh } = useFeed();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Feedback de carregamento para o usuário
  useEffect(() => {
    if (loading) {
      toast({
        title: "Carregando seu feed",
        description: "Buscando as últimas histórias...",
        duration: 2000,
      });
    }
  }, [loading, toast]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  console.log("Total stories in feed:", stories.length);
  
  // Filtrar histórias com base na busca
  const filteredStories = stories.filter(story => 
    story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (story.description && story.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (story.authorName && story.authorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Ordenar histórias
  const sortedStories = [...filteredStories].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.last_activity_at || b.updated_at).getTime() - 
               new Date(a.last_activity_at || a.updated_at).getTime();
      case 'oldest':
        return new Date(a.last_activity_at || a.updated_at).getTime() - 
               new Date(b.last_activity_at || b.updated_at).getTime();
      case 'records':
        return (b.recordCount || 0) - (a.recordCount || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Separate user's own stories
  const userStories = sortedStories.filter(s => s.isOwnStory);
  const followedStories = sortedStories.filter(s => !s.isOwnStory);
  
  // Última atualização para mostrar ao usuário
  const lastUpdate = loading 
    ? 'Carregando...' 
    : `Atualizado em ${format(new Date(), "'dia' dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-connectos-500" />
                Seu Feed
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{lastUpdate}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span>Atualizar</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1"
              >
                <Filter size={14} />
                <span>Filtros</span>
              </Button>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List size={14} />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <LayoutGrid size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-1/2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar histórias..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-1/3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Mais recentes</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Mais antigas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="records">
                        <div className="flex items-center gap-2">
                          <Star size={14} />
                          <span>Mais registros</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="name">
                        <div className="flex items-center gap-2">
                          <List size={14} />
                          <span>Nome</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {searchQuery && (
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {filteredStories.length} resultado(s) encontrado(s)
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Feed Completo</TabsTrigger>
                  <TabsTrigger value="mine">
                    <User size={14} className="mr-1" />
                    Minhas Histórias
                  </TabsTrigger>
                  <TabsTrigger value="following">
                    <Users size={14} className="mr-1" />
                    Seguindo
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <FeedStoriesList loading={loading} stories={sortedStories} />
                </TabsContent>
                
                <TabsContent value="mine">
                  <FeedStoriesList 
                    loading={loading} 
                    stories={userStories}
                    emptyMessage="Você ainda não criou nenhuma história"
                  />
                </TabsContent>
                
                <TabsContent value="following">
                  <FeedStoriesList 
                    loading={loading} 
                    stories={followedStories}
                    emptyMessage="Você ainda não está seguindo nenhum usuário ou história"
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="order-first md:order-last mb-6 md:mb-0">
              <FollowSuggestions onFollow={handleRefresh} />
              <StoryInsights stories={stories} className="mt-6" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Componente de insights
interface StoryInsightsProps {
  stories: any[];
  className?: string;
}

const StoryInsights: React.FC<StoryInsightsProps> = ({ stories, className }) => {
  // Cálculos básicos de estatísticas
  const totalStories = stories.length;
  const ownStories = stories.filter(s => s.isOwnStory).length;
  const followedStories = totalStories - ownStories;
  const totalRecords = stories.reduce((sum, story) => sum + (story.recordCount || 0), 0);
  
  if (totalStories === 0) return null;
  
  return (
    <div className={cn("bg-muted/30 rounded-lg p-4 border", className)}>
      <h3 className="font-medium mb-3 text-connectos-600">Estatísticas do Feed</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-muted-foreground">Total de histórias:</span> 
          <span className="font-medium">{totalStories}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted-foreground">Suas histórias:</span> 
          <span className="font-medium">{ownStories}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted-foreground">Histórias seguidas:</span> 
          <span className="font-medium">{followedStories}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted-foreground">Total de registros:</span> 
          <span className="font-medium">{totalRecords}</span>
        </li>
      </ul>
    </div>
  );
};

export default Feed;
