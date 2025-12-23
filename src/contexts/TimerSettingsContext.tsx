/**
 * Timer Settings Context
 * Manages timer settings with Unit of Work pattern
 * Improved with better error handling and documentation
 */

import { createContext, useContext, createSignal, onMount, onCleanup, ParentComponent } from "solid-js";
import { IUnitOfWork } from "../repositories/IUnitOfWork";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { TimerSettings, DEFAULT_TIMER_SETTINGS } from "../repositories/TimerSettingsRepository";

interface TimerSettingsContextValue {
  settings: () => TimerSettings;
  updateSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: () => boolean;
  error: () => string | null;
}

const TimerSettingsContext = createContext<TimerSettingsContextValue>();

interface TimerSettingsProviderProps {
  unitOfWork?: IUnitOfWork;
}

/**
 * Provider for timer settings with Unit of Work pattern
 * Supports dependency injection for testing
 */
export const TimerSettingsProvider: ParentComponent<TimerSettingsProviderProps> = (props) => {
  // Use injected Unit of Work or create default one
  const unitOfWork = props.unitOfWork ?? createUnitOfWork();

  const [settings, setSettings] = createSignal<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Load settings from repository on mount
  onMount(async () => {
    try {
      const loadedSettings = await unitOfWork.timerSettings.load();
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load settings";
      console.error("[TimerSettingsContext] " + errorMessage, err);
      setError(errorMessage);
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  });

  // Cleanup on unmount
  onCleanup(async () => {
    try {
      await unitOfWork.dispose();
    } catch (err) {
      console.error("[TimerSettingsContext] Cleanup error:", err);
    }
  });

  const updateSettings = async (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings(), ...newSettings };

    try {
      await unitOfWork.timerSettings.save(updated);
      setSettings(updated);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      console.error("[TimerSettingsContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const resetToDefaults = async () => {
    try {
      await unitOfWork.timerSettings.reset();
      setSettings(DEFAULT_TIMER_SETTINGS);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset settings";
      console.error("[TimerSettingsContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const value: TimerSettingsContextValue = {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading,
    error,
  };

  return (
    <TimerSettingsContext.Provider value={value}>
      {props.children}
    </TimerSettingsContext.Provider>
  );
};

export const useTimerSettings = () => {
  const context = useContext(TimerSettingsContext);
  if (!context) {
    throw new Error("useTimerSettings must be used within a TimerSettingsProvider");
  }
  return context;
};

// Re-export types for convenience
export type { TimerSettings };
export { DEFAULT_TIMER_SETTINGS };
