
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ObjectCard from '@/components/ObjectCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

// Define the object type
interface ObjectType {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
  recordCount?: number;
}

const Explore = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<ObjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchObjects();
  }, []);
  
  const fetchObjects = async () => {
    setIsLoading(true);
    try {
      // Fetch all public objects
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // For each object, count its records
      if (data) {
        const objectsWithRecordCount = await Promise.all(data.map(async (obj) => {
          const { count, error: countError } = await supabase
            .from('records')
            .select('*', { count: 'exact', head: true })
            .eq('object_id', obj.id);
          
          return {
            ...obj,
            recordCount: count || 0
          };
        }));
        
        setObjects(objectsWithRecordCount);
        setFilteredObjects(objectsWithRecordCount);
      }
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast({
        title: "Erro ao carregar objetos",
        description: "Não foi possível carregar a lista de objetos. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = objects.filter(obj => 
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (obj.description && obj.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects(objects);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredObjects(objects);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Explorar objetos</h1>
              <p className="text-muted-foreground mt-1">Descubra histórias de objetos compartilhados publicamente</p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar objetos..."
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
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" className="rounded-l-none absolute right-0">
                  Buscar
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Carregando objetos..." : `${filteredObjects.length} objetos encontrados`}
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredObjects.map((object) => (
                <ObjectCard 
                  key={object.id}
                  id={object.id}
                  name={object.name}
                  description={object.description || ""}
                  lastUpdated={new Date(object.updated_at).toLocaleDateString('pt-BR')}
                  isPublic={Boolean(object.is_public)}
                  recordCount={object.recordCount || 0}
                />
              ))}
            </div>
          )}
          
          {!isLoading && filteredObjects.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Nenhum objeto encontrado</h3>
              <p className="text-muted-foreground mt-1">Tente uma busca diferente ou explore outros termos</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearSearch}
              >
                Ver todos os objetos
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
