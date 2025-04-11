
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-connectos-50/50 to-transparent -z-10"></div>
      
      {/* Floating circles decoration */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-connectos-100 blur-3xl opacity-40 animate-float -z-10"></div>
      <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-connectos-200 blur-3xl opacity-30 animate-float -z-10" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main hero section */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="relative mb-8 p-6">
              <div className="absolute inset-0 rounded-full bg-connectos-100 animate-float -z-10"></div>
              <div className="text-5xl font-bold text-connectos-500 p-4">
                <Tag size={64} strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Dê uma <span className="text-connectos-400">alma digital</span> aos seus objetos
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              ConnectOS cria uma identidade digital para seus objetos físicos através de etiquetas NFC. 
              Registre memórias, histórias, momentos e mídias para dar vida às suas posses mais queridas.
            </p>
            
            <Button asChild size="lg" className="bg-connectos-400 hover:bg-connectos-500">
              <Link to="/object/new">
                <Tag className="mr-2 h-5 w-5" />
                Registrar um objeto
              </Link>
            </Button>
          </div>
          
          {/* Manifesto section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-connectos-600">A Vida Invisível das Coisas</h2>
              
              <div className="pl-5 border-l-4 border-connectos-200 space-y-4">
                <p className="text-lg">
                  <span className="font-bold">As coisas não são coisas.</span><br />
                  Elas carregam histórias, afetos, suor, ideias, tempo, memória.
                  Nós esquecemos disso. Mas elas não esqueceram de nós.
                  Elas estavam apenas esperando que alguém as ouvisse.
                </p>
                
                <p className="text-lg">
                  <span className="font-bold">O mundo físico perdeu sua alma. O digital perdeu sua profundidade.</span><br />
                  A velocidade nos desconectou da essência.
                  O algoritmo tornou tudo superficial, repetitivo, descartável.
                  Mas nós acreditamos em presença. Em tempo. Em significado.
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="pl-5 border-l-4 border-connectos-200 space-y-4">
                <p className="text-lg">
                  <span className="font-bold">Todo objeto tem uma vida que vai além da matéria.</span><br />
                  Uma cadeira não é apenas madeira.
                  É a mente de quem a desenhou.
                  As mãos que a moldaram.
                  As conversas que ela sustentou.
                  O objeto é um ser. Não no sentido biológico, mas no sentido simbólico.
                </p>
                
                <p className="text-lg">
                  <span className="font-bold">O NFC não é um chip. É um portal.</span><br />
                  Ele não serve só para abrir links.
                  Ele acessa um espírito digital — um espaço vivo onde aquele objeto continua evoluindo, registrando, interagindo.
                  O NFC é a chave da alma digital.
                </p>
              </div>
              
              <p className="text-xl font-semibold text-connectos-600 text-center md:text-right">
                ConnectOS: A Alma Digital das Coisas.
              </p>
              
              <div className="flex justify-center md:justify-end">
                <Button asChild variant="outline" className="group">
                  <Link to="/explore">
                    Explorar objetos
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Features/Benefits section */}
          <div className="mt-24 bg-connectos-50/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Como o ConnectOS transforma seus objetos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-connectos-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-connectos-600 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Memória Expandida</h3>
                <p>Registre todas as histórias, momentos e significados de cada objeto importante para você.</p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-connectos-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-connectos-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Conexão Física-Digital</h3>
                <p>Use tags NFC para acessar instantaneamente a alma digital de qualquer objeto com um toque do celular.</p>
              </div>
              
              <div className="bg-white/80 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-connectos-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-connectos-600 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Legado Preservado</h3>
                <p>Garanta que as histórias e valores dos seus objetos nunca se percam com o tempo ou entre gerações.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
