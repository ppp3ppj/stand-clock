/**
 * Timer Settings Form Hook
 * Manages timer settings form state with change detection
 */

import { createSignal, createEffect } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";

export interface TimerSettingsFormControl {
  // Form values
  workDuration: () => number;
  setWorkDuration: (value: number) => void;
  shortBreakDuration: () => number;
  setShortBreakDuration: (value: number) => void;
  longBreakDuration: () => number;
  setLongBreakDuration: (value: number) => void;
  sessionsBeforeLongBreak: () => number;
  setSessionsBeforeLongBreak: (value: number) => void;
  soundEnabled: () => boolean;
  setSoundEnabled: (value: boolean) => void;
  
  // Form state
  hasChanges: () => boolean;
  isSaving: () => boolean;
  
  // Actions
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Custom hook for managing timer settings form
 */
export function useTimerSettingsForm(): TimerSettingsFormControl {
  const { settings, updateSettings, resetToDefaults, isLoading } = useTimerSettings();

  // Local state for form fields
  const [workDuration, setWorkDuration] = createSignal(settings().workDuration);
  const [shortBreakDuration, setShortBreakDuration] = createSignal(settings().shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = createSignal(settings().longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = createSignal(
    settings().sessionsBeforeLongBreak
  );
  const [soundEnabled, setSoundEnabled] = createSignal(settings().soundEnabled);
  const [isSaving, setIsSaving] = createSignal(false);

  // Sync local state when settings change
  createEffect(() => {
    if (!isLoading()) {
      setWorkDuration(settings().workDuration);
      setShortBreakDuration(settings().shortBreakDuration);
      setLongBreakDuration(settings().longBreakDuration);
      setSessionsBeforeLongBreak(settings().sessionsBeforeLongBreak);
      setSoundEnabled(settings().soundEnabled);
    }
  });

  // Check if form has changes
  const hasChanges = (): boolean => {
    return (
      workDuration() !== settings().workDuration ||
      shortBreakDuration() !== settings().shortBreakDuration ||
      longBreakDuration() !== settings().longBreakDuration ||
      sessionsBeforeLongBreak() !== settings().sessionsBeforeLongBreak ||
      soundEnabled() !== settings().soundEnabled
    );
  };

  // Save settings
  const save = async () => {
    if (!hasChanges()) return;
    
    setIsSaving(true);
    try {
      await updateSettings({
        workDuration: workDuration(),
        shortBreakDuration: shortBreakDuration(),
        longBreakDuration: longBreakDuration(),
        sessionsBeforeLongBreak: sessionsBeforeLongBreak(),
        soundEnabled: soundEnabled(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const reset = async () => {
    if (confirm("Are you sure you want to reset to default settings?")) {
      await resetToDefaults();
    }
  };

  return {
    workDuration,
    setWorkDuration,
    shortBreakDuration,
    setShortBreakDuration,
    longBreakDuration,
    setLongBreakDuration,
    sessionsBeforeLongBreak,
    setSessionsBeforeLongBreak,
    soundEnabled,
    setSoundEnabled,
    hasChanges,
    isSaving,
    save,
    reset,
  };
}
