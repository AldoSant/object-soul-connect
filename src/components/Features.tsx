
import React from 'react';
import { Clock, Shield, BookOpen, Link as LinkIcon } from 'lucide-react';

const features = [
  {
    title: "História cronológica",
    description: "Construa uma linha do tempo para cada objeto, documentando sua jornada ao longo do tempo.",
    icon: <Clock className="h-10 w-10 text-connectos-400" />
  },
  {
    title: "Privacidade controlada",
    description: "Escolha se o histórico do objeto é público ou privado, você tem total controle.",
    icon: <Shield className="h-10 w-10 text-connectos-400" />
  },
  {
    title: "Diário digital",
    description: "Adicione registros, comentários e memórias para contar a história completa do objeto.",
    icon: <BookOpen className="h-10 w-10 text-connectos-400" />
  },
  {
    title: "Link único",
    description: "Cada objeto possui um link exclusivo, facilmente acessível através de uma etiqueta NFC.",
    icon: <LinkIcon className="h-10 w-10 text-connectos-400" />
  }
];

const Features: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-connectos-800/50 py-20">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Como o ConnectOS funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-connectos-800 p-6 rounded-lg border">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
