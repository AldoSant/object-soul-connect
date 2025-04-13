
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
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
    
    // Debug log for testing
    console.log('PWA Banner check - isStandalone:', isStandalone);
    
    // Check if the user has previously dismissed the banner
    const hasDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    
    if (isStandalone || hasDismissed) {
      console.log('PWA Banner hidden: already installed or dismissed');
      setShowBanner(false);
      return;
    }

    // FOR TESTING: Force show banner for browsers that don't support install prompt
    // This ensures the banner appears regardless of browser support
    setTimeout(() => {
      if (!showBanner && !deferredPrompt) {
        console.log('Forcing PWA banner to show for testing');
        setShowBanner(true);
      }
    }, 2000);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show the banner
      setShowBanner(true);
      console.log('Install prompt captured and banner should show');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showBanner, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available, showing fallback instructions');
      // Provide fallback instructions based on browser
      const ua = navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      
      if (isIOS && isSafari) {
        alert('Para instalar: toque no ícone de compartilhamento e selecione "Adicionar à Tela de Início"');
      } else {
        alert('Acesse este site no Chrome ou Safari para instalar o aplicativo');
      }
      return;
    }
    
    // Show the installation prompt
    deferredPrompt.prompt();
    console.log('PWA install prompt triggered');
    
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
    <div className="fixed bottom-4 right-4 z-50 max-w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
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
        className="w-full bg-primary hover:bg-primary/90 text-white"
      >
        <Download className="mr-2 h-4 w-4" />
        {isMobile ? 'Adicionar à tela inicial' : 'Instalar aplicativo'}
      </Button>
    </div>
  );
};

export default PWAInstallBanner;
