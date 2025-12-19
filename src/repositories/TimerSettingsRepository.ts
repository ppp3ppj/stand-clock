import Database from '@tauri-apps/plugin-sql';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

/**
 * Repository interface for timer settings persistence
 */
export interface ITimerSettingsRepository {
  /**
   * Load timer settings from storage
   */
  load(): Promise<TimerSettings>;

  /**
   * Save timer settings to storage
   */
  save(settings: TimerSettings): Promise<void>;

  /**
   * Reset settings to defaults
   */
  reset(): Promise<void>;
}

/**
 * SQLite implementation of timer settings repository
 */
export class SqliteTimerSettingsRepository implements ITimerSettingsRepository {
  private db: Database | null = null;
  private readonly dbPath = 'sqlite:standclock.db';

  private async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load(this.dbPath);
    }
    return this.db;
  }

  async load(): Promise<TimerSettings> {
    try {
      const db = await this.getDatabase();
      const result = await db.select<Array<{
        work_duration: number;
        short_break_duration: number;
        long_break_duration: number;
        sessions_before_long_break: number;
      }>>("SELECT * FROM timer_settings WHERE id = 1");

      if (result.length > 0) {
        const row = result[0];
        return {
          workDuration: row.work_duration,
          shortBreakDuration: row.short_break_duration,
          longBreakDuration: row.long_break_duration,
          sessionsBeforeLongBreak: row.sessions_before_long_break,
        };
      }

      return DEFAULT_TIMER_SETTINGS;
    } catch (error) {
      console.error("[SqliteTimerSettingsRepository] Failed to load settings:", error);
      throw error;
    }
  }

  async save(settings: TimerSettings): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.execute(
        `UPDATE timer_settings
         SET work_duration = $1,
             short_break_duration = $2,
             long_break_duration = $3,
             sessions_before_long_break = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          settings.workDuration,
          settings.shortBreakDuration,
          settings.longBreakDuration,
          settings.sessionsBeforeLongBreak,
        ]
      );
      console.log("[SqliteTimerSettingsRepository] Settings saved successfully");
    } catch (error) {
      console.error("[SqliteTimerSettingsRepository] Failed to save settings:", error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    await this.save(DEFAULT_TIMER_SETTINGS);
    console.log("[SqliteTimerSettingsRepository] Settings reset to defaults");
  }
}

/**
 * LocalStorage implementation of timer settings repository (for web-only builds)
 */
export class LocalStorageTimerSettingsRepository implements ITimerSettingsRepository {
  private readonly storageKey = 'timer-settings';

  async load(): Promise<TimerSettings> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      return DEFAULT_TIMER_SETTINGS;
    } catch (error) {
      console.error("[LocalStorageTimerSettingsRepository] Failed to load settings:", error);
      return DEFAULT_TIMER_SETTINGS;
    }
  }

  async save(settings: TimerSettings): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
      console.log("[LocalStorageTimerSettingsRepository] Settings saved successfully");
    } catch (error) {
      console.error("[LocalStorageTimerSettingsRepository] Failed to save settings:", error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    await this.save(DEFAULT_TIMER_SETTINGS);
    console.log("[LocalStorageTimerSettingsRepository] Settings reset to defaults");
  }
}

/**
 * Factory function to create the appropriate repository based on environment
 */
export function createTimerSettingsRepository(): ITimerSettingsRepository {
  // Use SQLite for Tauri app
  return new SqliteTimerSettingsRepository();

  // Alternative: Use localStorage for web builds
  // return new LocalStorageTimerSettingsRepository();
}
