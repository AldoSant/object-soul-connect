
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { seedStories } from '@/utils/seedDatabase';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const SeedDatabase: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedStories();
      toast({
        title: "Sucesso!",
        description: "Banco de dados populado com histórias de exemplo.",
      });
    } catch (error) {
      console.error("Erro ao popular banco de dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível popular o banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      disabled={isSeeding}
      className="bg-connectos-400 hover:bg-connectos-500"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Populando...
        </>
      ) : (
        "Criar exemplos de histórias"
      )}
    </Button>
  );
};

export default SeedDatabase;
