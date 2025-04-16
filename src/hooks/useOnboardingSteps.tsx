
import React from 'react';
import { BookOpen, User, MessagesSquare, PlusCircle, ScrollText, Rss } from 'lucide-react';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
}

export const useOnboardingSteps = () => {
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Bem-vindo ao ConnectOS",
      description: "O ConnectOS é um sistema que dá vida digital às coisas. Aqui, objetos, espaços e memórias ganham uma identidade expandida. Vamos guiar você pelos primeiros passos.",
      icon: <BookOpen className="h-12 w-12 text-connectos-500" />,
    },
    {
      id: 2,
      title: "Complete seu perfil",
      description: "Personalize seu perfil com informações e uma foto. Isso ajuda outros usuários a encontrar e conectar-se com você.",
      icon: <User className="h-12 w-12 text-connectos-500" />,
      action: {
        label: "Editar Perfil",
        path: "/profile"
      }
    },
    {
      id: 3,
      title: "Crie sua primeira história",
      description: "Histórias são narrativas sobre objetos e suas jornadas. Crie sua primeira história para começar a registrar memórias digitais.",
      icon: <PlusCircle className="h-12 w-12 text-connectos-500" />,
      action: {
        label: "Nova História",
        path: "/story/new"
      }
    },
    {
      id: 4,
      title: "Explore e siga",
      description: "Explore histórias criadas por outros usuários e siga aquelas que despertem seu interesse para acompanhar novos registros.",
      icon: <Rss className="h-12 w-12 text-connectos-500" />,
      action: {
        label: "Explorar",
        path: "/explore"
      }
    },
    {
      id: 5,
      title: "Interaja e comente",
      description: "Participe da comunidade comentando nas histórias e interagindo com outros usuários. Cada comentário enriquece a narrativa digital.",
      icon: <MessagesSquare className="h-12 w-12 text-connectos-500" />,
    },
  ];

  return { steps };
};
