/**
 * Pomodoro Session Hook
 * Manages complete pomodoro session lifecycle and state
 */

import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import { useSessionTracking } from "../contexts/SessionTrackingContext";
import { minutesToSeconds } from "../utils/timeUtils";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export interface PomodoroSessionControl {
  // Timer state
  mode: () => TimerMode;
  timeLeft: () => number;
  isRunning: () => boolean;
  sessionCount: () => number;
  hasSessionStarted: () => boolean;
  
  // Timer controls
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: TimerMode) => void;
  skipToNext: () => void;
  
  // Progress
  getProgress: () => number;
  
  // Break activity
  showBreakActivitySelector: () => boolean;
  handleBreakActivitySelect: (activity: string) => void;
  closeBreakActivitySelector: () => void;
}

/**
 * Custom hook for managing complete pomodoro session state and logic
 */
export function usePomodoroSession(
  onPlayNotification: () => void,
  onPlayPopAlert: () => void
): PomodoroSessionControl {
  const { settings, isLoading: settingsLoading } = useTimerSettings();
  const {
    startSession: trackStartSession,
    completeSession: trackCompleteSession,
    skipSession: trackSkipSession,
    abandonSession: trackAbandonSession,
    selectBreakActivity,
    currentMode: mode,
    setCurrentMode: setMode,
    timeLeft,
    setTimeLeft,
    isTimerRunning: isRunning,
    setIsTimerRunning: setIsRunning,
    sessionCount,
    setSessionCount,
    wasRunningBeforeLeave,
    setWasRunningBeforeLeave,
  } = useSessionTracking();

  const [showBreakActivitySelector, setShowBreakActivitySelector] = createSignal(false);
  const [hasSessionStarted, setHasSessionStarted] = createSignal(false);
  let intervalId: number | null = null;

  // Get duration for a mode
  const getDuration = (selectedMode: TimerMode): number => {
    const durations = {
      pomodoro: minutesToSeconds(settings().workDuration),
      shortBreak: minutesToSeconds(settings().shortBreakDuration),
      longBreak: minutesToSeconds(settings().longBreakDuration),
    };
    return durations[selectedMode];
  };

  // Initialize timer with current mode duration
  const initializeTimer = (selectedMode: TimerMode) => {
    setTimeLeft(getDuration(selectedMode));
    setIsRunning(false);
  };

  // Clear interval
  const clearTimer = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    clearTimer();
    setIsRunning(false);
    setHasSessionStarted(false);
    onPlayNotification();

    trackCompleteSession().catch((err) =>
      console.error("Failed to track session completion:", err)
    );

    if (mode() === "pomodoro") {
      const newSessionCount = sessionCount() + 1;
      setSessionCount(newSessionCount);

      // Auto-switch to break
      if (newSessionCount % settings().sessionsBeforeLongBreak === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    }
  };

  // Start timer interval
  const startTimerInterval = () => {
    intervalId = window.setInterval(() => {
      const current = timeLeft();
      if (current <= 1) {
        handleTimerComplete();
        setTimeLeft(0);
      } else {
        setTimeLeft(current - 1);
      }
    }, 1000);
  };

  // Toggle timer
  const toggleTimer = () => {
    if (isRunning()) {
      // Pause
      clearTimer();
      setIsRunning(false);
    } else {
      // Start
      setIsRunning(true);
      setHasSessionStarted(true);
      
      trackStartSession(mode(), getDuration(mode()));

      if (mode() !== "pomodoro") {
        setShowBreakActivitySelector(true);
      }

      startTimerInterval();
    }
  };

  // Reset timer
  const resetTimer = () => {
    onPlayPopAlert();

    if (isRunning()) {
      trackAbandonSession().catch((err) =>
        console.error("Failed to track abandoned session:", err)
      );
    }

    clearTimer();
    setIsRunning(false);
    setHasSessionStarted(false);
    initializeTimer(mode());
  };

  // Switch mode
  const switchMode = (newMode: TimerMode) => {
    clearTimer();
    setMode(newMode);
    setIsRunning(false);
    setHasSessionStarted(false);
    initializeTimer(newMode);
  };

  // Skip to next phase
  const skipToNext = () => {
    onPlayPopAlert();

    if (isRunning()) {
      trackSkipSession().catch((err) =>
        console.error("Failed to track skipped session:", err)
      );
    }

    clearTimer();
    setIsRunning(false);

    if (mode() === "pomodoro") {
      const newSessionCount = sessionCount() + 1;
      setSessionCount(newSessionCount);

      if (newSessionCount % settings().sessionsBeforeLongBreak === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("pomodoro");
    }
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const total = getDuration(mode());
    return total > 0 ? ((total - timeLeft()) / total) * 100 : 0;
  };

  // Handle break activity selection
  const handleBreakActivitySelect = (activity: string) => {
    selectBreakActivity(activity);
    setShowBreakActivitySelector(false);
  };

  const closeBreakActivitySelector = () => {
    setShowBreakActivitySelector(false);
  };

  // Initialize timer when settings are loaded
  createEffect(() => {
    if (!settingsLoading() && timeLeft() === 0) {
      initializeTimer(mode());
    }
  });

  // Update timer when settings change (only if session hasn't started)
  createEffect(() => {
    if (!settingsLoading() && !hasSessionStarted() && !isRunning()) {
      const newDuration = getDuration(mode());
      if (timeLeft() !== newDuration && timeLeft() !== 0) {
        setTimeLeft(newDuration);
      }
    }
  });

  // Resume timer if it was running before leaving
  onMount(() => {
    if (wasRunningBeforeLeave()) {
      setIsRunning(true);
      startTimerInterval();
      setWasRunningBeforeLeave(false);
    }
  });

  // Pause timer when leaving
  onCleanup(() => {
    if (isRunning()) {
      clearTimer();
      setWasRunningBeforeLeave(true);
      setIsRunning(false);
    } else {
      setWasRunningBeforeLeave(false);
    }
  });

  return {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    hasSessionStarted,
    toggleTimer,
    resetTimer,
    switchMode,
    skipToNext,
    getProgress,
    showBreakActivitySelector,
    handleBreakActivitySelect,
    closeBreakActivitySelector,
  };
}
