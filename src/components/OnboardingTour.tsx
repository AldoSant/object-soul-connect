
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, MessagesSquare, PlusCircle, ScrollText, Rss } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
}

const OnboardingTour = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  const steps: Step[] = [
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

  // Verificar se é a primeira visita do usuário
  useEffect(() => {
    if (!user) return;

    const checkOnboardingStatus = async () => {
      try {
        // Verificar se o usuário já concluiu o onboarding
        const { data, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Se o campo não existir ou for falso, mostrar o onboarding
        if (data && data.has_completed_onboarding === false) {
          setHasCompletedOnboarding(false);
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status de onboarding:', error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Atualizar o perfil do usuário
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);

      if (error) throw error;

      setHasCompletedOnboarding(true);
      setShowOnboarding(false);

      toast({
        title: "Onboarding concluído",
        description: "Bem-vindo à comunidade ConnectOS!",
      });
    } catch (error) {
      console.error('Erro ao concluir onboarding:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Atualizar o estado mas não fechar o diálogo se o usuário não concluiu
    if (!hasCompletedOnboarding) {
      toast({
        title: "Complete o tour",
        description: "Recomendamos concluir o tour para aproveitar melhor a plataforma.",
        variant: "default",
      });
      return;
    }
    setShowOnboarding(false);
  };

  if (!showOnboarding || !user) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={showOnboarding} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <Badge variant="outline" className="w-fit mb-2 bg-connectos-50 text-connectos-700 border-connectos-200">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
          <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-6">
          {currentStepData.icon}
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2 flex-col sm:flex-row">
          <div>
            {currentStepData.action && (
              <Button variant="secondary" asChild>
                <a href={currentStepData.action.path}>
                  {currentStepData.action.label}
                </a>
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </DialogFooter>
        
        <PaginationContent className="justify-center mt-4">
          {steps.map((step, index) => (
            <PaginationItem key={step.id}>
              <Button
                variant={index === currentStep ? "default" : "ghost"}
                className={`w-3 h-3 p-0 rounded-full ${index === currentStep ? 'bg-connectos-500' : 'bg-muted'}`}
                onClick={() => setCurrentStep(index)}
              />
            </PaginationItem>
          ))}
        </PaginationContent>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
