
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Book, User, Tag, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SearchResult = {
  id: string;
  type: 'story' | 'user' | 'tag';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  date?: string;
  url: string;
};

const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'stories' | 'users' | 'tags'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carregar pesquisas recentes do localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Salvar pesquisa recente
  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Função de pesquisa
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    saveSearch(query);
    
    try {
      // Pesquisar histórias
      const { data: storiesData, error: storiesError } = await supabase
        .from('objects')
        .select('id, name, description, updated_at, thumbnail, user_id')
        .ilike('name', `%${query}%`)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (storiesError) throw storiesError;
      
      // Pesquisar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, updated_at')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);
        
      if (usersError) throw usersError;
      
      // Formatar resultados
      const storyResults: SearchResult[] = (storiesData || []).map(story => ({
        id: story.id,
        type: 'story',
        title: story.name,
        subtitle: story.description || 'Sem descrição',
        imageUrl: story.thumbnail || '',
        date: format(new Date(story.updated_at), "dd MMM yyyy", { locale: ptBR }),
        url: `/story/${story.id}`
      }));
      
      const userResults: SearchResult[] = (usersData || []).map(user => ({
        id: user.id,
        type: 'user',
        title: user.full_name || user.username || 'Usuário',
        subtitle: user.username ? `@${user.username}` : '',
        imageUrl: user.avatar_url || '',
        url: `/profile/${user.id}`
      }));
      
      // Filtrar resultados baseado na aba ativa
      let filteredResults: SearchResult[] = [];
      switch (activeTab) {
        case 'all':
          filteredResults = [...storyResults, ...userResults];
          break;
        case 'stories':
          filteredResults = storyResults;
          break;
        case 'users':
          filteredResults = userResults;
          break;
        case 'tags':
          // Implementação de tags pode ser adicionada no futuro
          filteredResults = [];
          break;
      }
      
      setResults(filteredResults);
    } catch (error: any) {
      console.error('Erro na pesquisa:', error);
      toast({
        title: 'Erro na pesquisa',
        description: 'Não foi possível completar a pesquisa',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navegar para o resultado
  const navigateToResult = (result: SearchResult) => {
    onClose();
    navigate(result.url);
  };

  // Limpar pesquisa
  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  // Pesquisar ao pressionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Usar pesquisa recente
  const useRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    // Executar a pesquisa automaticamente
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-2">Busca universal</DialogTitle>
          <DialogDescription>
            Encontre histórias, pessoas, objetos e mais no ConnectOS
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="O que você está buscando?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">Tudo</TabsTrigger>
            <TabsTrigger value="stories">Histórias</TabsTrigger>
            <TabsTrigger value="users">Pessoas</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <SearchResultsDisplay 
              results={results}
              isLoading={isLoading}
              query={query}
              recentSearches={recentSearches}
              onResultClick={navigateToResult}
              onRecentSearchClick={useRecentSearch}
              activeTab={activeTab}
            />
          </TabsContent>
          
          <TabsContent value="stories" className="mt-0">
            <SearchResultsDisplay 
              results={results.filter(r => r.type === 'story')}
              isLoading={isLoading}
              query={query}
              recentSearches={recentSearches}
              onResultClick={navigateToResult}
              onRecentSearchClick={useRecentSearch}
              activeTab={activeTab}
            />
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            <SearchResultsDisplay 
              results={results.filter(r => r.type === 'user')}
              isLoading={isLoading}
              query={query}
              recentSearches={recentSearches}
              onResultClick={navigateToResult}
              onRecentSearchClick={useRecentSearch}
              activeTab={activeTab}
            />
          </TabsContent>
          
          <TabsContent value="tags" className="mt-0">
            <div className="py-4 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p>A busca por tags estará disponível em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface SearchResultsDisplayProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  recentSearches: string[];
  onResultClick: (result: SearchResult) => void;
  onRecentSearchClick: (term: string) => void;
  activeTab: 'all' | 'stories' | 'users' | 'tags';
}

const SearchResultsDisplay = ({
  results,
  isLoading,
  query,
  recentSearches,
  onResultClick,
  onRecentSearchClick,
  activeTab
}: SearchResultsDisplayProps) => {
  
  if (isLoading) {
    return (
      <div className="py-8 text-center animate-pulse">
        <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">Buscando...</p>
      </div>
    );
  }
  
  if (!query) {
    if (recentSearches.length > 0) {
      return (
        <div className="py-2">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Pesquisas recentes</h4>
          <ScrollArea className="max-h-[300px]">
            {recentSearches.map((term, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => onRecentSearchClick(term)}
                className="flex items-center justify-start w-full px-2 py-1 h-auto mb-1"
              >
                <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                <span className="truncate">{term}</span>
              </Button>
            ))}
          </ScrollArea>
        </div>
      );
    }
    
    return (
      <div className="py-8 text-center">
        <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">Digite para buscar</p>
      </div>
    );
  }
  
  if (query && results.length === 0) {
    const noResultsMessage = (() => {
      switch (activeTab) {
        case 'all': return 'Nenhum resultado encontrado em todas as categorias';
        case 'stories': return 'Nenhuma história encontrada';
        case 'users': return 'Nenhum usuário encontrado';
        case 'tags': return 'Nenhuma tag encontrada';
      }
    })();
    
    return (
      <div className="py-8 text-center">
        <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">{noResultsMessage}</p>
        <p className="text-sm text-muted-foreground mt-1">Tente outros termos ou categorias</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-1 py-2">
        {results.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => onResultClick(result)}
            className="w-full px-2 py-2 hover:bg-accent rounded-md transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              {result.type === 'story' && (
                result.imageUrl ? (
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                    <img 
                      src={result.imageUrl} 
                      alt={result.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-connectos-100">
                    <Book className="h-5 w-5 text-connectos-500" />
                  </div>
                )
              )}
              
              {result.type === 'user' && (
                <Avatar className="h-10 w-10">
                  {result.imageUrl ? (
                    <img src={result.imageUrl} alt={result.title} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-connectos-100 text-connectos-500">
                      {result.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              )}
              
              {result.type === 'tag' && (
                <div className="h-10 w-10 rounded-md flex items-center justify-center bg-muted">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              
              <div className="text-left">
                <div className="font-medium">{result.title}</div>
                {result.subtitle && (
                  <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                )}
                
                {result.date && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {result.date}
                  </div>
                )}
              </div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SearchDialog;
