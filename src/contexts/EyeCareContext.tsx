import { createContext, useContext, createSignal, onMount, onCleanup, createEffect, ParentComponent } from "solid-js";
import { useTimerSettings } from "./TimerSettingsContext";
import notificationSound from "../assets/sounds/mixkit-notification-bell-592.wav";

interface EyeCareContextValue {
  // State
  isEnabled: () => boolean;
  isActive: () => boolean;
  isBreakActive: () => boolean;
  timeUntilBreak: () => number;
  breakTimeLeft: () => number;
  isSnoozed: () => boolean;
  snoozeTimeLeft: () => number;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  snooze: () => void;
  dismissBreak: () => void;

  // Lifecycle (called from HomePage)
  onPomodoroModeChange: (mode: string) => void;
  onPomodoroStart: () => void;
  onPomodoroPause: () => void;
}

const EyeCareContext = createContext<EyeCareContextValue>();

const STORAGE_KEY = 'eye-care-state';
const SNOOZE_DURATION = 300; // 5 minutes in seconds
const MAX_SNOOZE_COUNT = 3;

export const EyeCareProvider: ParentComponent = (props) => {
  const { settings } = useTimerSettings();

  // Core timer state
  const [isActive, setIsActive] = createSignal(false);
  const [isBreakActive, setIsBreakActive] = createSignal(false);
  const [timeUntilBreak, setTimeUntilBreak] = createSignal(0);
  const [breakTimeLeft, setBreakTimeLeft] = createSignal(0);

  // Snooze state
  const [isSnoozed, setIsSnoozed] = createSignal(false);
  const [snoozeTimeLeft, setSnoozeTimeLeft] = createSignal(0);
  const [snoozeCount, setSnoozeCount] = createSignal(0);

  // Pomodoro integration state
  const [currentPomodoroMode, setCurrentPomodoroMode] = createSignal<string>('pomodoro');

  // Interval IDs
  let workIntervalId: number | null = null;
  let breakIntervalId: number | null = null;
  let snoozeIntervalId: number | null = null;

  // Computed: is feature enabled from settings
  const isEnabled = () => settings().eyeCareEnabled;

  // Play sound when break starts
  const playEyeCareSound = () => {
    if (settings().eyeCareSoundEnabled) {
      const audio = new Audio(notificationSound);
      audio.volume = 0.5;
      audio.play().catch(err => console.log("[EyeCare] Sound failed:", err));
    }
  };

  // Clear all intervals
  const clearAllIntervals = () => {
    if (workIntervalId !== null) {
      clearInterval(workIntervalId);
      workIntervalId = null;
    }
    if (breakIntervalId !== null) {
      clearInterval(breakIntervalId);
      breakIntervalId = null;
    }
    if (snoozeIntervalId !== null) {
      clearInterval(snoozeIntervalId);
      snoozeIntervalId = null;
    }
  };

  // Start work interval countdown
  const startWorkInterval = () => {
    if (workIntervalId !== null) return; // Already running

    workIntervalId = window.setInterval(() => {
      setTimeUntilBreak(prev => {
        const next = prev - 1;
        if (next <= 0) {
          // Time for eye break!
          triggerEyeBreak();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  // Stop work interval countdown
  const stopWorkInterval = () => {
    if (workIntervalId !== null) {
      clearInterval(workIntervalId);
      workIntervalId = null;
    }
  };

  // Trigger eye break overlay
  const triggerEyeBreak = () => {
    stopWorkInterval();
    setIsBreakActive(true);
    setBreakTimeLeft(settings().eyeCareDuration);
    playEyeCareSound();

    // Start break countdown
    breakIntervalId = window.setInterval(() => {
      setBreakTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          // Break completed
          completeBreak();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  // Complete break and reset
  const completeBreak = () => {
    if (breakIntervalId !== null) {
      clearInterval(breakIntervalId);
      breakIntervalId = null;
    }
    setIsBreakActive(false);
    setBreakTimeLeft(0);
    setSnoozeCount(0); // Reset snooze count after break completes

    // Reset work timer
    setTimeUntilBreak(settings().eyeCareInterval * 60);

    // Resume work tracking if still in work mode
    if (isActive() && currentPomodoroMode() === 'pomodoro') {
      startWorkInterval();
    }
  };

  // Public actions
  const start = () => {
    if (!isEnabled()) return;
    if (isActive()) return; // Already active

    setIsActive(true);
    if (timeUntilBreak() === 0) {
      setTimeUntilBreak(settings().eyeCareInterval * 60);
    }

    // Only start if in pomodoro mode
    if (currentPomodoroMode() === 'pomodoro') {
      startWorkInterval();
    }
  };

  const pause = () => {
    setIsActive(false);
    stopWorkInterval();
  };

  const reset = () => {
    clearAllIntervals();
    setIsActive(false);
    setIsBreakActive(false);
    setTimeUntilBreak(settings().eyeCareInterval * 60);
    setBreakTimeLeft(0);
    setIsSnoozed(false);
    setSnoozeTimeLeft(0);
    setSnoozeCount(0);
  };

  const snooze = () => {
    if (snoozeCount() >= MAX_SNOOZE_COUNT) {
      // Max snoozes reached, force break
      return;
    }

    setSnoozeCount(prev => prev + 1);
    setIsSnoozed(true);
    setSnoozeTimeLeft(SNOOZE_DURATION);
    dismissBreak();

    // Start snooze countdown
    snoozeIntervalId = window.setInterval(() => {
      setSnoozeTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          // Snooze expired, trigger break again
          setIsSnoozed(false);
          if (snoozeIntervalId !== null) {
            clearInterval(snoozeIntervalId);
            snoozeIntervalId = null;
          }
          triggerEyeBreak();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const dismissBreak = () => {
    if (breakIntervalId !== null) {
      clearInterval(breakIntervalId);
      breakIntervalId = null;
    }
    setIsBreakActive(false);
    setBreakTimeLeft(0);
  };

  // Pomodoro lifecycle integration
  const onPomodoroModeChange = (mode: string) => {
    setCurrentPomodoroMode(mode);

    if (mode === 'pomodoro') {
      // Resume work tracking if active
      if (isActive() && !isBreakActive() && !isSnoozed()) {
        startWorkInterval();
      }
    } else {
      // Pause work tracking during breaks
      stopWorkInterval();
    }
  };

  const onPomodoroStart = () => {
    if (!isEnabled()) return;
    start();
  };

  const onPomodoroPause = () => {
    pause();
  };

  // Save state to localStorage periodically
  const saveState = () => {
    if (isActive()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timeUntilBreak: timeUntilBreak(),
        lastUpdateTimestamp: Date.now(),
        isActive: isActive(),
      }));
    }
  };

  // Restore state from localStorage on mount
  const restoreState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { timeUntilBreak: savedTime, lastUpdateTimestamp, isActive: wasActive } = JSON.parse(saved);
        const elapsedSeconds = Math.floor((Date.now() - lastUpdateTimestamp) / 1000);
        const newTime = Math.max(0, savedTime - elapsedSeconds);

        if (newTime > 0 && wasActive && isEnabled()) {
          setTimeUntilBreak(newTime);
          // Don't auto-start, wait for Pomodoro to start
        } else {
          reset();
        }
      } else {
        setTimeUntilBreak(settings().eyeCareInterval * 60);
      }
    } catch (error) {
      console.error("[EyeCare] Failed to restore state:", error);
      setTimeUntilBreak(settings().eyeCareInterval * 60);
    }
  };

  // Initialize on mount
  onMount(() => {
    restoreState();
  });

  // Save state periodically and on cleanup
  createEffect(() => {
    const interval = setInterval(saveState, 5000); // Save every 5 seconds
    onCleanup(() => {
      clearInterval(interval);
      saveState();
      clearAllIntervals();
    });
  });

  // Effect: Reset timer when settings change
  createEffect(() => {
    if (isEnabled()) {
      // If interval changed, update current countdown (only if not in break)
      if (!isBreakActive() && !isActive()) {
        setTimeUntilBreak(settings().eyeCareInterval * 60);
      }
    } else {
      // Feature disabled, cleanup
      reset();
    }
  });

  // Keyboard shortcuts for overlay
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isBreakActive()) return;

      if (e.key === 'Escape') {
        dismissBreak();
      } else if (e.key === 's' || e.key === 'S') {
        snooze();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  const value: EyeCareContextValue = {
    isEnabled,
    isActive,
    isBreakActive,
    timeUntilBreak,
    breakTimeLeft,
    isSnoozed,
    snoozeTimeLeft,
    start,
    pause,
    reset,
    snooze,
    dismissBreak,
    onPomodoroModeChange,
    onPomodoroStart,
    onPomodoroPause,
  };

  return (
    <EyeCareContext.Provider value={value}>
      {props.children}
    </EyeCareContext.Provider>
  );
};

export const useEyeCare = () => {
  const context = useContext(EyeCareContext);
  if (!context) {
    throw new Error("useEyeCare must be used within an EyeCareProvider");
  }
  return context;
};
