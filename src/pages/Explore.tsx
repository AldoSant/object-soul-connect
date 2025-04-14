import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import StoryCard from '@/components/StoryCard';
import { supabase } from '@/integrations/supabase/client';
import { type StoryType, jsonToLocation, Story } from '@/types';
import { Filter, MapPin, Tag as TagIcon, Search, LibraryBig, Plus, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type SortOption = 'recent' | 'alphabetical' | 'popularity';

const STORY_TYPES: { value: StoryType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'objeto', label: 'Objeto' },
  { value: 'pessoa', label: 'Pessoa' },
  { value: 'espaço', label: 'Espaço' },
  { value: 'evento', label: 'Evento' },
  { value: 'outro', label: 'Outro' },
];

const ITEMS_PER_PAGE = 20;

const Explore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoryType, setSelectedStoryType] = useState<'all' | StoryType>('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numOfStoriesToGenerate, setNumOfStoriesToGenerate] = useState(20);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedStories, setDisplayedStories] = useState<Story[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    filterStories();
  }, [stories, searchQuery, selectedStoryType, selectedLocation, sortOption]);
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedStories(filteredStories.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredStories.length / ITEMS_PER_PAGE));
  }, [filteredStories, currentPage]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const { data: objects, error: objectsError } = await supabase
        .from('objects')
        .select('*');

      if (objectsError) throw objectsError;

      const { data: records, error: recordsError } = await supabase
        .from('records')
        .select('object_id');

      if (recordsError) throw recordsError;

      const countMap: Record<string, number> = {};
      if (records) {
        records.forEach(record => {
          const objectId = record.object_id;
          countMap[objectId] = (countMap[objectId] || 0) + 1;
        });
      }

      const storiesData = (objects || []).map(obj => ({
        ...obj,
        recordCount: countMap[obj.id] || 0,
        location: jsonToLocation(obj.location)
      })) as Story[];

      setStories(storiesData);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Erro ao carregar histórias",
        description: "Não foi possível buscar as histórias. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStories = () => {
    let filtered = [...stories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(story =>
        story.name.toLowerCase().includes(query) ||
        (story.description && story.description.toLowerCase().includes(query))
      );
    }

    if (selectedStoryType !== 'all') {
      filtered = filtered.filter(story => story.story_type === selectedStoryType);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(story => {
        if (!story.location) return false;
        
        const locationStr = [
          story.location.city,
          story.location.state,
          story.location.country
        ].filter(Boolean).join(', ').toLowerCase();
        
        return locationStr.includes(selectedLocation.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'popularity') {
        return (b.recordCount || 0) - (a.recordCount || 0);
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredStories(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStoryType('all');
    setSelectedLocation('all');
    setSortOption('recent');
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storyTypes = [...new Set(stories.map(s => s.story_type).filter(Boolean))];
  
  const locations = stories
    .filter(s => s.location)
    .map(s => {
      if (!s.location) return [];
      
      return [
        s.location.city,
        s.location.state,
        s.location.country
      ].filter(Boolean);
    })
    .flat()
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

  const generateSampleStories = async () => {
    setIsGenerating(true);
    
    try {
      const sampleNames = [
        "Violão Gibson J-45", "Câmera Leica M6", "Relógio Rolex Submariner",
        "Mesa de Jantar Vitoriana", "Piano Steinway", "Antiga Máquina de Escrever Remington",
        "Cadeira Eames Lounge", "Baú de Viagem Louis Vuitton", "Bicicleta Peugeot Vintage",
        "Anel de Diamante Tiffany", "Vinil Original dos Beatles", "Livro Primeira Edição de Dom Quixote",
        "Telescópio Celestron", "Boneca de Porcelana Francesa", "Espada Samurai Antiga",
        "Mapa-múndi do Século XVIII", "Escultura Modernista", "Caneta Montblanc Meisterstück",
        "Xícara de Chá de Porcelana Chinesa", "Despertador Art Déco", "Colar de Pérolas Mikimoto",
        "Botas de Cowboy Tony Lama", "Quadro Impressionista", "Faca de Chef Japonesa",
        "Álbum de Fotos de Família", "Máquina de Café Italiana", "Rádio Zenith Vintage",
        "Vaso Murano", "Tapete Persa", "Globo Terrestre Antigo",
        "Conjunto de Chá de Prata", "Urso de Pelúcia da Infância", "Brinquedo Lego Raro",
        "Lustre de Cristal", "Kimono de Seda Japonês", "Caixa de Música Antiga",
        "Bandeira Histórica", "Moeda Rara de Ouro", "Instrumento Musical Exótico",
        "Ábaco Chinês", "Capacete de Guerra Medieval", "Telefone Rotativo Antigo",
        "Pente de Tartaruga Art Nouveau", "Harpa Celtic", "Ampulheta Veneziana",
        "Microscópio de Latão", "Caixa de Ferramentas do Avô", "Sextante Náutico",
        "Gramofone Antigo", "Bússola de Navegação", "Martelo Cerimonial",
        "Vestido de Noiva da Avó", "Escrivaninha Chippendale", "Bule Marroquino",
        "Armadura Japonesa", "Tinteiro Vitoriano", "Leque Oriental",
        "Broche Art Deco", "Jogo de Xadrez de Jade", "Espelho Veneziano",
        "Uniforme Militar Histórico", "Medalha Olímpica", "Baralho de Tarô Antigo",
        "Trof��u Esportivo", "Calculadora Mecânica", "Máscaras Tribais",
        "Pulseira Berbere", "Flauta Nativa Americana", "Fóssil Raro",
        "Meteorito", "Cristal Raro", "Conchas Marinhas Raras",
        "Brinquedo de Lata Vintage", "Ferradura da Sorte", "Âncora de Navio",
        "Pedras do Muro de Berlim", "Tijolo da Grande Muralha da China", "Artefato Arqueológico",
        "Pintura Rupestre Reproduzida", "Primeiro Computador Pessoal", "Prensa Tipográfica",
        "Luneta Antiga", "Tear Manual", "Manto Cerimonial",
        "Carrinho de Bebê Antigo", "Serviço de Jantar de Porcelana", "Conjunto de Ferramentas de Jardim",
        "Balança Antiga", "Cofre de Aço", "Algemas Antigas",
        "Estatueta de Bronze", "Narguilé Otomano", "Sabre Árabe",
        "Pipas Chinesas", "Kit de Caligrafia", "Astrolábio",
        "Lamparina a Óleo", "Leitor de Microficha", "Filmadora Super 8",
        "Disco de Vinil", "Projetor de Slides", "Walkman Original",
        "Primeiro Modelo de iPhone", "Nintendo Game Boy", "Atari 2600",
        "PlayStation Original", "Commodore 64", "Máquina de Costura Singer",
        "Casaco de Pele Vintage", "Chapéu Fedora Clássico", "Luvas de Boxe Antigas",
        "Troféu da Copa do Mundo", "Raquete de Tênis Histórica", "Bastão de Baseball Autografado",
        "Ingresso da Copa de 70", "Poster dos Jogos Olímpicos de 1936", "Mapa Estelar",
        "Criptex de Madeira", "Fichário de Bibliotecário", "Mala-Biblioteca",
        "Livro de Receitas da Avó", "Álbum de Selos", "Coleção de Botões",
        "Moedas de Todo o Mundo", "Cadernos de Viagem", "Diário Antigo",
        "Cadeado Ornamentado", "Instrumento Cirúrgico Antigo", "Ferramentas de Relojoeiro",
        "Kit de Química Vintage", "Barco em Miniatura", "Cachimbo Esculpido",
        "Alfinete de Gravata Vitoriano", "Pandeiro de Pastor", "Chaves de Porta Antigas",
        "Cinzeiro Art Déco", "Lanterna Coleman", "Cantil Militar",
        "Sela de Cavalo", "Espelho de Mão de Prata", "Binóculos de Ópera",
        "Chaveiro Especial", "Gaiola de Pássaro Decorativa", "Incensário de Bronze",
        "Colar Tribal", "Carrinho de Miniatura", "Relíquia Familiar",
        "Bandeira da Primeira Viagem", "Medalha de Reconhecimento", "Cartões Postais Antigos",
        "Conjunto de Canetas-Tinteiro", "Gravador de Fita", "Protetor de Tela de TV",
        "Primeiro Telefone Celular", "Livro Autografado por Celebridade", "Pôster de Filme Clássico",
        "Cartaz de Propaganda Vintage", "Jogo de Tabuleiro Antigo", "Brinquedo de Infância",
        "Primeiro Instrumento Musical", "Máquina Fotográfica Kodak", "Lancheira Escolar Vintage"
      ];
      
      const sampleDescriptions = [
        "Adquirido em uma pequena loja em Paris durante uma viagem inesquecível.",
        "Herança de família que passou por gerações, carregando histórias e memórias.",
        "Um presente especial que marcou um momento importante da minha vida.",
        "Encontrado por acaso em um mercado de antiguidades em uma cidade pequena.",
        "Companheiro de inúmeras aventuras e momentos significativos.",
        "Um objeto que testemunhou a transformação de uma época para outra.",
        "Peça rara que representa um período importante da história.",
        "Tesouro pessoal que simboliza uma conquista significativa.",
        "Item que conecta o passado ao presente através de suas histórias.",
        "Objeto de admiração que inspirou muitas conversas e reflexões.",
        "Relíquia que sobreviveu a momentos difíceis e guarda muitas histórias.",
        "Artefato que traz à tona memórias de pessoas e lugares especiais.",
        "Peça singular que reflete um estilo de vida e uma época.",
        "Item que acompanhou jornadas e aventuras pelo mundo.",
        "Objeto que representa uma paixão cultivada ao longo dos anos.",
        "Criação artesanal que carrega a essência de quem a produziu.",
        "Símbolo de um momento histórico que transformou trajetórias.",
        "Peça que preserva técnicas tradicionais quase esquecidas.",
        "Item que conecta gerações através de histórias e significados.",
        "Objeto de contemplação que inspira novas ideias e perspectivas.",
        "Relíquia que carrega em si a essência de uma cultura distante.",
        "Peça que testemunhou momentos de transformação pessoal.",
        "Artefato que sobreviveu ao tempo e preserva memórias preciosas.",
        "Item que representa uma busca por conhecimento e descobertas.",
        "Objeto que simboliza valores e princípios importantes.",
      ];
      
      const cities = [
        "Paris", "Nova York", "Tóquio", "Londres", "Roma", "Cairo", "Sydney",
        "Berlim", "Cidade do México", "São Paulo", "Mumbai", "Pequim", "Moscou",
        "Istambul", "Marraquexe", "Lisboa", "Buenos Aires", "Amsterdam", "Kyoto",
        "Barcelona", "Praga", "Budapeste", "Cidade do Cabo", "Veneza", "Viena",
        "Bangkok", "Jerusalém", "Rio de Janeiro", "Dublin", "Helsinki"
      ];
      
      const countries = [
        "França", "Estados Unidos", "Japão", "Reino Unido", "Itália", "Egito", 
        "Austrália", "Alemanha", "México", "Brasil", "Índia", "China", "Rússia",
        "Turquia", "Marrocos", "Portugal", "Argentina", "Holanda", "Espanha",
        "República Tcheca", "Hungria", "África do Sul", "Tailândia", "Israel", 
        "Irlanda", "Finlândia", "Grécia", "Peru", "Canadá", "Noruega"
      ];
      
      const storyTypes: StoryType[] = ["objeto", "pessoa", "espaço", "evento", "outro"];
      
      const stories = [];
      
      for (let i = 0; i < numOfStoriesToGenerate; i++) {
        const randomNameIndex = Math.floor(Math.random() * sampleNames.length);
        const randomDescIndex = Math.floor(Math.random() * sampleDescriptions.length);
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const randomStateIndex = Math.floor(Math.random() * 10);
        const randomCountryIndex = Math.floor(Math.random() * countries.length);
        const randomStoryTypeIndex = Math.floor(Math.random() * storyTypes.length);
        
        const hasLocation = Math.random() > 0.3;
        
        const location = hasLocation ? {
          city: cities[randomCityIndex],
          state: randomStateIndex < 7 ? `Estado de ${cities[randomCityIndex]}` : "",
          country: countries[randomCountryIndex]
        } : null;
        
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
        
        const updatedAt = new Date(createdAt);
        updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * (new Date().getDate() - createdAt.getDate())));
        
        const hasCoverImage = Math.random() > 0.7;
        const hasThumbnail = Math.random() > 0.7;
        
        const coverImageNumber = Math.floor(Math.random() * 30) + 1;
        const thumbnailNumber = Math.floor(Math.random() * 30) + 1;
        
        stories.push({
          id: uuidv4(),
          name: sampleNames[randomNameIndex],
          description: sampleDescriptions[randomDescIndex],
          is_public: Math.random() > 0.2,
          story_type: storyTypes[randomStoryTypeIndex],
          location: location,
          cover_image: hasCoverImage ? `https://source.unsplash.com/random/800x600?sig=${coverImageNumber}` : null,
          thumbnail: hasThumbnail ? `https://source.unsplash.com/random/400x300?sig=${thumbnailNumber}` : null,
          created_at: createdAt.toISOString(),
          updated_at: updatedAt.toISOString()
        });
        
        sampleNames.splice(randomNameIndex, 1);
        if (sampleNames.length === 0) break;
      }
      
      const batchSize = 10;
      for (let i = 0; i < stories.length; i += batchSize) {
        const batch = stories.slice(i, i + batchSize);
        
        const { error } = await supabase.from('objects').insert(
          batch.map(story => ({
            name: story.name,
            description: story.description,
            is_public: story.is_public,
            story_type: story.story_type,
            location: story.location,
            cover_image: story.cover_image,
            thumbnail: story.thumbnail,
            created_at: story.created_at,
            updated_at: story.updated_at
          }))
        );
        
        if (error) throw error;
        
        if (i + batchSize < stories.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast({
        title: "Histórias geradas com sucesso!",
        description: `${stories.length} novas histórias foram adicionadas ao banco de dados.`,
      });
      
      await loadStories();
    } catch (error) {
      console.error('Error generating sample stories:', error);
      toast({
        title: "Erro ao gerar histórias",
        description: "Ocorreu um erro ao gerar histórias de exemplo. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setShowGenerateDialog(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pageNumbers.push(-1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2);
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 bg-gradient-to-b from-connectos-50/30 to-transparent">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-connectos-700">Explorar histórias</h1>
            <Badge variant="secondary" className="gap-1">
              <LibraryBig size={16} />
              <span>{stories.length} histórias</span>
            </Badge>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar histórias..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={sortOption}
                      onValueChange={(value) => setSortOption(value as SortOption)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Mais recentes</SelectItem>
                        <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
                        <SelectItem value="popularity">Mais populares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex gap-1 items-center">
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Gerar</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gerar histórias de exemplo</DialogTitle>
                        <DialogDescription>
                          Crie um conjunto de histórias de exemplo para popular o banco de dados.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="numOfStories">Número de histórias a gerar</Label>
                          <Input
                            id="numOfStories"
                            type="number"
                            value={numOfStoriesToGenerate}
                            onChange={(e) => setNumOfStoriesToGenerate(parseInt(e.target.value) || 20)}
                            min={1}
                            max={100}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancelar</Button>
                        <Button onClick={generateSampleStories} disabled={isGenerating}>
                          {isGenerating ? "Gerando..." : "Gerar histórias"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="default"
                    onClick={() => navigate('/story/new')}
                    className="bg-connectos-400 hover:bg-connectos-500"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Nova história</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center mr-2">
                  <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filtros:</span>
                </div>
                
                <Select
                  value={selectedStoryType}
                  onValueChange={(value) => setSelectedStoryType(value as 'all' | StoryType)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <TagIcon className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as localizações</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(searchQuery || selectedStoryType !== 'all' || selectedLocation !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-connectos-400"></div>
            </div>
          ) : filteredStories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    name={story.name}
                    description={story.description || ''}
                    lastUpdated={format(new Date(story.updated_at), 'dd/MM/yyyy')}
                    isPublic={story.is_public || false}
                    recordCount={story.recordCount || 0}
                    storyType={story.story_type || undefined}
                    location={story.location || undefined}
                    thumbnailUrl={story.thumbnail || undefined}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="my-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === -1 || pageNum === -2 ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <LibraryBig className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma história encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedStoryType || selectedLocation
                  ? "Tente ajustar seus filtros ou criar uma nova história."
                  : "Comece criando sua primeira história digital."}
              </p>
              <Button asChild className="bg-connectos-400 hover:bg-connectos-500">
                <Link to="/story/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar nova história
                </Link>
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
