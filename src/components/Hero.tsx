
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Tag, FileText } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="py-20 px-4 flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-connectos-100 animate-float -z-10"></div>
        <div className="text-5xl font-bold text-connectos-500 p-4">
          <Tag size={64} strokeWidth={1.5} />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Dê uma <span className="text-connectos-400">alma digital</span> aos seus objetos
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        ConnectOS cria uma identidade digital para seus objetos físicos através de etiquetas NFC. 
        Registre memórias, histórias e momentos para dar vida às suas posses mais queridas.
      </p>
      
      <div className="max-w-3xl mb-12 text-left space-y-4 px-6">
        <p className="text-lg">
          O mundo físico perdeu sua alma. O digital perdeu sua profundidade.
          A velocidade nos desconectou da essência.
          Mas nós acreditamos em presença. Em tempo. Em significado.
        </p>
        <p className="text-lg">
          Todo objeto tem uma vida que vai além da matéria.
          Uma cadeira não é apenas madeira.
          É a mente de quem a desenhou.
          As mãos que a moldaram.
          As conversas que ela sustentou.
          O objeto é um ser. Não no sentido biológico, mas no sentido simbólico.
        </p>
        <p className="text-lg">
          O NFC não é um chip. É um portal.
          Ele não serve só para abrir links.
          Ele acessa um espírito digital — um espaço vivo onde aquele objeto continua evoluindo, registrando, interagindo.
          O NFC é a chave da alma digital.
        </p>
        <p className="text-lg font-semibold text-connectos-600">
          ConnectOS: A Alma Digital das Coisas.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button asChild size="lg" className="bg-connectos-400 hover:bg-connectos-500">
          <Link to="/object/new">
            <FileText className="mr-2 h-5 w-5" />
            Registrar um objeto
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Hero;
