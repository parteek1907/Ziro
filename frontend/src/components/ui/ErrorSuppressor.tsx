"use client";

import { useEffect } from "react";

export function ErrorSuppressor() {
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('unsupported color function')) {
        return;
      }
      originalConsoleError(...args);
    };
    
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('unsupported color function')) {
        return;
      }
      originalConsoleWarn(...args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  return null;
}
