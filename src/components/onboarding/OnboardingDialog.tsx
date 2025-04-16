
import React from 'react';
import { OnboardingStep } from '@/hooks/useOnboardingSteps';
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

interface OnboardingDialogProps {
  currentStep: number;
  steps: OnboardingStep[];
  open: boolean;
  onClose: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
  currentStep,
  steps,
  open,
  onClose,
  onPrevStep,
  onNextStep
}) => {
  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              onClick={onPrevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button onClick={onNextStep}>
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
                onClick={() => ({/*  Não implementar ação de click aqui para garantir consistência na experiência de onboarding  */})}
              />
            </PaginationItem>
          ))}
        </PaginationContent>
      </DialogContent>
    </Dialog>
  );
};
