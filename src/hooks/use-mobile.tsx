
import { useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // For SSR or initial render, check if window exists
    return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
  });

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check on mount
    checkMobile();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(checkMobile);
    resizeObserver.observe(document.body);

    // Also monitor orientation changes on mobile devices
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, [checkMobile]);

  return isMobile;
}
