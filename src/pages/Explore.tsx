
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ObjectCard from '@/components/ObjectCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from 'lucide-react';

// Mock data for demonstration
const mockObjects = [
  {
    id: "123",
    name: "Violão Takamine EG341SC",
    description: "Meu violão acústico, comprado em 2010. Ele me acompanhou em muitas viagens e momentos importantes.",
    lastUpdated: "22/10/2022",
    isPublic: true,
    recordCount: 3
  },
  {
    id: "124",
    name: "Relógio de Bolso Vintage",
    description: "Relógio de bolso que pertenceu ao meu avô. Fabricado em 1945 e passado de geração em geração.",
    lastUpdated: "15/03/2023",
    isPublic: true,
    recordCount: 5
  },
  {
    id: "125",
    name: "Câmera Analógica Canon AE-1",
    description: "Minha primeira câmera analógica. Comprada em um brechó em 2018. Já fotografou muitas paisagens.",
    lastUpdated: "07/06/2023",
    isPublic: true,
    recordCount: 8
  },
  {
    id: "126",
    name: "Livro Assinado",
    description: "Exemplar de 'Cem Anos de Solidão' assinado pelo autor em uma feira literária.",
    lastUpdated: "29/09/2022",
    isPublic: true,
    recordCount: 2
  },
  {
    id: "127",
    name: "Mesa de Jantar",
    description: "Mesa de madeira maciça feita por artesão local em 2015. Testemunhou muitas refeições em família.",
    lastUpdated: "11/01/2023",
    isPublic: false,
    recordCount: 4
  },
  {
    id: "128",
    name: "Computador Antigo",
    description: "Meu primeiro computador pessoal. Um PC montado em 2005 com Windows XP.",
    lastUpdated: "19/11/2022",
    isPublic: true,
    recordCount: 6
  }
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredObjects, setFilteredObjects] = useState(mockObjects);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = mockObjects.filter(obj => 
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        obj.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects(mockObjects);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredObjects(mockObjects);
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
              {filteredObjects.length} objetos encontrados
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjects.map((object) => (
              <ObjectCard 
                key={object.id}
                id={object.id}
                name={object.name}
                description={object.description}
                lastUpdated={object.lastUpdated}
                isPublic={object.isPublic}
                recordCount={object.recordCount}
              />
            ))}
          </div>
          
          {filteredObjects.length === 0 && (
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
