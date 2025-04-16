
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Book, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManifestoTouchProps {
  location: 'feed' | 'story' | 'object' | 'profile';
}

const manifestoLines = [
  "As coisas não são coisas. Elas carregam histórias, afetos, suor, ideias, tempo, memória.",
  "O mundo físico perdeu sua alma. O digital perdeu sua profundidade.",
  "Todo objeto tem uma vida que vai além da matéria.",
  "O NFC não é um chip. É um portal.",
  "Criamos o ConnectOS para que o mundo possa lembrar.",
  "Tudo agora tem um "eu digital".",
  "Não criamos um app. Criamos um ecossistema de consciência.",
  "Resgatamos o tempo profundo num mundo raso.",
  "Não digitalizamos produtos. Acordamos seres.",
  "Somos os que dão vida àquilo que foi esquecido."
];

const ManifestoTouch: React.FC<ManifestoTouchProps> = ({ location }) => {
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Selecionar uma citação aleatória do manifesto com base na localização
  useEffect(() => {
    let filteredLines = manifestoLines;
    
    // Personalizar as citações com base na localização
    switch (location) {
      case 'feed':
        filteredLines = manifestoLines.filter((_, i) => [0, 4, 6, 7].includes(i));
        break;
      case 'story':
        filteredLines = manifestoLines.filter((_, i) => [0, 2, 4, 8].includes(i));
        break;
      case 'object':
        filteredLines = manifestoLines.filter((_, i) => [2, 3, 5, 8].includes(i));
        break;
      case 'profile':
        filteredLines = manifestoLines.filter((_, i) => [4, 6, 9].includes(i));
        break;
    }
    
    // Escolher uma citação aleatória
    const randomIndex = Math.floor(Math.random() * filteredLines.length);
    setCurrentQuote(filteredLines[randomIndex]);
    
    // Mostrar a citação após um tempo aleatório
    const timer = setTimeout(() => {
      setShowQuote(true);
    }, Math.random() * 10000 + 5000); // Entre 5 e 15 segundos
    
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* Citação flutuante */}
      <AnimatePresence>
        {showQuote && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50 max-w-xs"
          >
            <div className="bg-black/80 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
              <Quote className="h-5 w-5 text-connectos-300 absolute -top-2 -left-2" />
              <p className="text-sm italic">"{currentQuote}"</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-connectos-300">ConnectOS Manifesto</span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={() => setIsExpanded(true)}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={() => setShowQuote(false)}
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Botão do Manifesto e Popover */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed bottom-4 right-4 z-50">
              <Popover open={isExpanded} onOpenChange={setIsExpanded}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-black text-white border-none shadow-lg hover:bg-connectos-900"
                  >
                    <Book className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="bg-gradient-to-br from-black to-connectos-950 text-white p-4 border-none rounded-lg shadow-xl">
                    <h3 className="font-bold text-lg mb-2 text-connectos-100">Manifesto ConnectOS</h3>
                    <h4 className="text-sm italic text-connectos-300 mb-3">A Vida Invisível das Coisas</h4>
                    
                    <ScrollArea className="h-[300px] pr-4">
                      <ol className="space-y-4">
                        {manifestoLines.map((line, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="pb-2 border-b border-white/10 last:border-0"
                          >
                            <span className="font-semibold text-connectos-300">{index + 1}.</span> {line}
                          </motion.li>
                        ))}
                      </ol>
                    </ScrollArea>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsExpanded(false)}
                        className="text-sm text-connectos-300 hover:text-white hover:bg-white/10"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Manifesto ConnectOS</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default ManifestoTouch;
