
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoryCard from '@/components/StoryCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { Search, Filter, X, MapPin, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Story, StoryType, jsonToLocation } from '@/types';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Explore = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<StoryType | "">("");
  const [locationFilter, setLocationFilter] = useState("");
  const storiesPerPage = 9; // 3x3 grid
  
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      // Fetch all public stories
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each story, count its records
      if (data) {
        const storiesWithRecordCount = await Promise.all(data.map(async (story) => {
          const { count, error: countError } = await supabase
            .from('records')
            .select('*', { count: 'exact', head: true })
            .eq('object_id', story.id);
          
          // Transform the data to match our Story interface
          return {
            ...story,
            recordCount: count || 0,
            location: jsonToLocation(story.location),
            story_type: (story.story_type || 'objeto') as StoryType
          } as Story;
        }));
        
        setStories(storiesWithRecordCount);
        setFilteredStories(storiesWithRecordCount);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Erro ao carregar histórias",
        description: "Não foi possível carregar a lista de histórias. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...stories];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story => 
        story.name.toLowerCase().includes(query) || 
        (story.description && story.description.toLowerCase().includes(query))
      );
    }
    
    // Apply story type filter
    if (selectedType) {
      filtered = filtered.filter(story => story.story_type === selectedType);
    }
    
    // Apply location filter
    if (locationFilter.trim()) {
      const locationQuery = locationFilter.toLowerCase();
      filtered = filtered.filter(story => {
        if (!story.location) return false;
        
        const locationString = JSON.stringify(story.location).toLowerCase();
        return locationString.includes(locationQuery);
      });
    }
    
    setFilteredStories(filtered);
    setCurrentPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setLocationFilter("");
    setFilteredStories(stories);
    setCurrentPage(1);
  };
  
  // Pagination logic
  const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = filteredStories.slice(indexOfFirstStory, indexOfLastStory);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const renderPaginationItems = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => paginate(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // If there are many pages, use ellipsis
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis1">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
      
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => paginate(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // If there are many pages, use ellipsis
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis2">
          <span className="flex h-9 w-9 items-center justify-center">...</span>
        </PaginationItem>
      );
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => paginate(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-connectos-700">Explorar histórias</h1>
              <p className="text-muted-foreground mt-1">Descubra histórias compartilhadas publicamente</p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar histórias..."
                  className="pl-9 pr-12 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-12 h-full"
                    onClick={() => {
                      setSearchQuery("");
                      applyFilters();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" className="rounded-l-none absolute right-0 bg-connectos-400 hover:bg-connectos-500">
                  Buscar
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Carregando histórias..." : `${filteredStories.length} histórias encontradas`}
            </p>
            
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Filtrar histórias</DrawerTitle>
                    <DrawerDescription>
                      Aplique filtros para encontrar histórias específicas
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Tipo de história</Label>
                        <RadioGroup 
                          value={selectedType} 
                          onValueChange={(value) => setSelectedType(value as StoryType | "")}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="" id="todos" />
                            <Label htmlFor="todos">Todos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="objeto" id="filter-objeto" />
                            <Label htmlFor="filter-objeto">Objeto</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pessoa" id="filter-pessoa" />
                            <Label htmlFor="filter-pessoa">Pessoa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="espaço" id="filter-espaco" />
                            <Label htmlFor="filter-espaco">Espaço</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evento" id="filter-evento" />
                            <Label htmlFor="filter-evento">Evento</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="outro" id="filter-outro" />
                            <Label htmlFor="filter-outro">Outro</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label htmlFor="location" className="text-sm font-medium">Localização</Label>
                        <div className="flex items-center mt-2">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="Cidade, estado ou país..."
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button onClick={applyFilters} className="bg-connectos-400 hover:bg-connectos-500">
                      Aplicar filtros
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStories.map((story) => (
                  <StoryCard 
                    key={story.id}
                    id={story.id}
                    name={story.name}
                    description={story.description || ""}
                    lastUpdated={new Date(story.updated_at).toLocaleDateString('pt-BR')}
                    isPublic={Boolean(story.is_public)}
                    recordCount={story.recordCount || 0}
                    storyType={story.story_type as StoryType}
                    location={story.location}
                    thumbnailUrl={story.thumbnail}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="my-10">
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    
                    {renderPaginationItems()}
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => paginate(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
          
          {!isLoading && filteredStories.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Nenhuma história encontrada</h3>
              <p className="text-muted-foreground mt-1">Tente uma busca diferente ou explore outros termos</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
              >
                Ver todas as histórias
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
