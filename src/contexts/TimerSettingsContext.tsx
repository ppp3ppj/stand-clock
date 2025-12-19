import { createContext, useContext, createSignal, onMount, ParentComponent } from "solid-js";
import Database from '@tauri-apps/plugin-sql';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface TimerSettingsContextValue {
  settings: () => TimerSettings;
  updateSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: () => boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const TimerSettingsContext = createContext<TimerSettingsContextValue>();

export const TimerSettingsProvider: ParentComponent = (props) => {
  const [settings, setSettings] = createSignal<TimerSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = createSignal(true);
  const [db, setDb] = createSignal<Database>();

  // Load settings from database on mount
  onMount(async () => {
    try {
      const database = await Database.load('sqlite:standclock.db');
      setDb(database);

      // Fetch settings from database
      const result = await database.select<Array<{
        work_duration: number;
        short_break_duration: number;
        long_break_duration: number;
        sessions_before_long_break: number;
      }>>("SELECT * FROM timer_settings WHERE id = 1");

      if (result.length > 0) {
        const dbSettings = result[0];
        setSettings({
          workDuration: dbSettings.work_duration,
          shortBreakDuration: dbSettings.short_break_duration,
          longBreakDuration: dbSettings.long_break_duration,
          sessionsBeforeLongBreak: dbSettings.sessions_before_long_break,
        });
      }
    } catch (error) {
      console.error("Failed to load timer settings:", error);
    } finally {
      setIsLoading(false);
    }
  });

  const updateSettings = async (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings(), ...newSettings };
    setSettings(updated);

    // Save to database
    const database = db();
    if (database) {
      try {
        await database.execute(
          `UPDATE timer_settings
           SET work_duration = $1,
               short_break_duration = $2,
               long_break_duration = $3,
               sessions_before_long_break = $4,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`,
          [
            updated.workDuration,
            updated.shortBreakDuration,
            updated.longBreakDuration,
            updated.sessionsBeforeLongBreak,
          ]
        );
        console.log("Timer settings saved to database");
      } catch (error) {
        console.error("Failed to save timer settings:", error);
      }
    }
  };

  const resetToDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);

    // Reset in database
    const database = db();
    if (database) {
      try {
        await database.execute(
          `UPDATE timer_settings
           SET work_duration = $1,
               short_break_duration = $2,
               long_break_duration = $3,
               sessions_before_long_break = $4,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`,
          [
            DEFAULT_SETTINGS.workDuration,
            DEFAULT_SETTINGS.shortBreakDuration,
            DEFAULT_SETTINGS.longBreakDuration,
            DEFAULT_SETTINGS.sessionsBeforeLongBreak,
          ]
        );
        console.log("Timer settings reset to defaults");
      } catch (error) {
        console.error("Failed to reset timer settings:", error);
      }
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
