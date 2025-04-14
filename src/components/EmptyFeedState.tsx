
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

const EmptyFeedState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border">
      <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium mb-2">Seu feed está vazio</h3>
      <p className="text-muted-foreground mb-4">
        Comece seguindo outros usuários para ver suas histórias aqui.
      </p>
      <Button 
        variant="default" 
        onClick={() => navigate('/explore')}
        className="bg-connectos-400 hover:bg-connectos-500"
      >
        Explorar histórias
      </Button>
    </div>
  );
};

export default EmptyFeedState;
