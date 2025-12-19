import { createContext, useContext, createSignal, onMount, ParentComponent } from "solid-js";
import {
  ITimerSettingsRepository,
  TimerSettings,
  DEFAULT_TIMER_SETTINGS,
  createTimerSettingsRepository
} from "../repositories/TimerSettingsRepository";

interface TimerSettingsContextValue {
  settings: () => TimerSettings;
  updateSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: () => boolean;
}

const TimerSettingsContext = createContext<TimerSettingsContextValue>();

interface TimerSettingsProviderProps {
  repository?: ITimerSettingsRepository;
}

/**
 * Provider for timer settings with dependency injection support
 */
export const TimerSettingsProvider: ParentComponent<TimerSettingsProviderProps> = (props) => {
  // Use injected repository or create default one
  const repository = props.repository ?? createTimerSettingsRepository();

  const [settings, setSettings] = createSignal<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const [isLoading, setIsLoading] = createSignal(true);

  // Load settings from repository on mount
  onMount(async () => {
    try {
      const loadedSettings = await repository.load();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("[TimerSettingsContext] Failed to load settings:", error);
      // Keep default settings on error
    } finally {
      setIsLoading(false);
    }
  });

  const updateSettings = async (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings(), ...newSettings };

    try {
      await repository.save(updated);
      setSettings(updated);
    } catch (error) {
      console.error("[TimerSettingsContext] Failed to save settings:", error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      await repository.reset();
      setSettings(DEFAULT_TIMER_SETTINGS);
    } catch (error) {
      console.error("[TimerSettingsContext] Failed to reset settings:", error);
      throw error;
    }
  };

  const value: TimerSettingsContextValue = {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading,
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
