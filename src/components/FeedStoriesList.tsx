
import React, { useState } from 'react';
import StoryCard from '@/components/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyFeedState from '@/components/EmptyFeedState';
import { PlusCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FeedStoriesListProps {
  loading: boolean;
  stories: any[];
  emptyMessage?: string;
  itemsPerPage?: number;
}

const FeedStoriesList: React.FC<FeedStoriesListProps> = ({ 
  loading, 
  stories,
  emptyMessage = "Seu feed está vazio. Siga usuários para ver suas histórias.",
  itemsPerPage = 5 // Número reduzido para melhor experiência
}) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculando o total de páginas
  const totalPages = Math.max(1, Math.ceil(stories.length / itemsPerPage));
  
  // Obtendo as histórias para a página atual
  const currentStories = stories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Função para mudar de página
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    
    toast({
      title: `Página ${page} de ${totalPages}`,
      description: `Mostrando ${Math.min(itemsPerPage, stories.length - (page-1) * itemsPerPage)} histórias`,
      duration: 1500,
    });
  };
  
  console.log(`FeedStoriesList: ${stories.length} histórias recebidas, mostrando página ${currentPage} de ${totalPages}`);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-[150px] w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <p className="text-sm text-muted-foreground animate-pulse">Carregando histórias...</p>
        </div>
      </div>
    );
  }
  
  if (stories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border shadow-sm">
        <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4 animate-float" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {emptyMessage}
        </h3>
        <Button asChild className="mt-2 bg-connectos-400 hover:bg-connectos-500 shadow-md transition-all duration-300">
          <Link to="/story/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar nova história
          </Link>
        </Button>
      </div>
    );
  }
  
  console.log("Exibindo histórias:", currentStories.map(s => ({id: s.id, nome: s.name, isOwn: s.isOwnStory})));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {currentStories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            name={story.name}
            description={story.description || ''}
            lastUpdated={story.lastUpdated}
            isPublic={story.is_public}
            recordCount={story.recordCount}
            storyType={story.story_type}
            location={story.location}
            thumbnailUrl={story.thumbnail}
            authorName={story.authorName}
            authorAvatar={story.authorAvatar}
            authorId={story.authorId}
            isOwnStory={story.isOwnStory}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => changePage(currentPage - 1)}
                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => changePage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => changePage(currentPage + 1)}
                className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default FeedStoriesList;
