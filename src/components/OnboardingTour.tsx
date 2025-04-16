
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingDialog } from '@/components/onboarding/OnboardingDialog';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';

const OnboardingTour = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const { steps } = useOnboardingSteps();

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

  return (
    <OnboardingDialog
      currentStep={currentStep}
      steps={steps}
      onClose={handleClose}
      onPrevStep={prevStep}
      onNextStep={nextStep}
      open={showOnboarding}
    />
  );
};

export default OnboardingTour;
