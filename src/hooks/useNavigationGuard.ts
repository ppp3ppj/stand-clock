/**
 * Navigation Guard Hook
 * Prevents navigation when timer is running to avoid accidental resets
 */

import { useNavigate, useLocation } from "@solidjs/router";
import { createEffect, onCleanup } from "solid-js";
import { useSessionTracking } from "../contexts/SessionTrackingContext";

export interface NavigationGuardOptions {
  enabled: boolean;
  message?: string;
}

/**
 * Hook to guard navigation when timer is running
 */
export function useNavigationGuard() {
  const { isTimerRunning } = useSessionTracking();
  const location = useLocation();
  const navigate = useNavigate();
  
  let lastPath = location.pathname;

  // Prevent navigation when timer is running
  createEffect(() => {
    const currentPath = location.pathname;
    
    // Check if path changed and timer is running
    if (currentPath !== lastPath && isTimerRunning()) {
      const confirmLeave = confirm(
        "Timer is currently running. Leaving this page will pause the timer. Do you want to continue?"
      );
      
      if (!confirmLeave) {
        // Navigate back to previous page
        navigate(lastPath, { replace: true });
        return;
      }
    }
    
    lastPath = currentPath;
  });

  return {
    isTimerRunning,
    canNavigate: () => !isTimerRunning(),
  };
}
