
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone || 
                       document.referrer.includes('android-app://');
    
    // Check if the user has previously dismissed the banner
    const hasDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    
    if (isStandalone || hasDismissed) {
      setShowBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }
    
    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[320px] bg-white dark:bg-connectos-800 rounded-lg shadow-lg border border-connectos-200 dark:border-connectos-700 p-4 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-connectos-700 dark:text-connectos-300">
          Instalar App
        </h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Instale o ConnectOS para uma experiência completa offline e acesso rápido.
      </p>
      <Button 
        onClick={handleInstallClick}
        className="w-full bg-connectos-500 hover:bg-connectos-600 text-white"
      >
        <Download className="mr-2 h-4 w-4" />
        {isMobile ? 'Adicionar à tela inicial' : 'Instalar aplicativo'}
      </Button>
    </div>
  );
};

export default PWAInstallBanner;
