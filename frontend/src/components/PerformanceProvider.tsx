"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import gsap from "gsap";

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const performanceMode = useSettingsStore(state => state.appearance.performanceMode);

  useEffect(() => {
    if (performanceMode) {
      document.body.classList.add("performance-mode");
      gsap.globalTimeline.timeScale(999); // Fast-forward GSAP animations
    } else {
      document.body.classList.remove("performance-mode");
      gsap.globalTimeline.timeScale(1);
    }
  }, [performanceMode]);

  return (
    <MotionConfig reducedMotion={performanceMode ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
