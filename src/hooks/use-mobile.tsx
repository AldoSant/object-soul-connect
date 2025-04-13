
import { useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Para SSR ou renderização inicial, verifica se window existe
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Usa ResizeObserver para melhor desempenho
    const resizeObserver = new ResizeObserver(checkMobile);
    resizeObserver.observe(document.body);

    // Também monitora mudanças de orientação em dispositivos móveis
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, [checkMobile]);

  return isMobile;
}
