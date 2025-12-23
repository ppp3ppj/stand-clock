/**
 * Timer Hook
 * Encapsulates timer logic following Single Responsibility Principle
 */

import { createSignal, onCleanup } from "solid-js";

export interface TimerOptions {
  initialTime: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
}

export interface TimerControl {
  timeLeft: () => number;
  isRunning: () => boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (time: number) => void;
  toggle: () => void;
}

/**
 * Custom hook for countdown timer logic
 */
export function useTimer(options: TimerOptions): TimerControl {
  const [timeLeft, setTimeLeft] = createSignal(options.initialTime);
  const [isRunning, setIsRunning] = createSignal(false);
  let intervalId: number | null = null;

  const clearTimer = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const start = () => {
    if (isRunning()) return;
    
    setIsRunning(true);
    intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        options.onTick?.(newTime);
        
        if (newTime <= 0) {
          clearTimer();
          setIsRunning(false);
          options.onComplete?.();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  const pause = () => {
    clearTimer();
    setIsRunning(false);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(options.initialTime);
  };

  const setTime = (time: number) => {
    setTimeLeft(time);
  };

  const toggle = () => {
    if (isRunning()) {
      pause();
    } else {
      start();
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    clearTimer();
  });

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    setTime,
    toggle,
  };
}
