
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle, Compass } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-connectos-700 dark:text-connectos-300 mb-4">
            Comece sua jornada
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Registre histórias digitais para objetos, pessoas, espaços e eventos importantes.
            Preserve memórias, compartilhe significados e crie conexões no tempo.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button asChild className="bg-connectos-500 hover:bg-connectos-600 flex-1">
            <Link to="/story/new" className="flex items-center justify-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar história
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="flex-1">
            <Link to="/explore" className="flex items-center justify-center">
              <Compass className="mr-2 h-4 w-4" />
              Explorar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
