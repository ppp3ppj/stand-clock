import { IUnitOfWork } from './IUnitOfWork';
import { ActivityType } from './SessionHistoryRepository';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  defaultBreakActivity: ActivityType | 'ask'; // 'ask' means show popup
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  defaultBreakActivity: 'ask',
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
 * Works with Unit of Work pattern for transaction management
 */
export class SqliteTimerSettingsRepository implements ITimerSettingsRepository {
  constructor(private unitOfWork: IUnitOfWork) {}

  async load(): Promise<TimerSettings> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{
        work_duration: number;
        short_break_duration: number;
        long_break_duration: number;
        sessions_before_long_break: number;
        sound_enabled?: number;
        default_break_activity?: string;
      }>>("SELECT * FROM timer_settings WHERE id = 1");

      if (result.length > 0) {
        const row = result[0];
        return {
          workDuration: row.work_duration,
          shortBreakDuration: row.short_break_duration,
          longBreakDuration: row.long_break_duration,
          sessionsBeforeLongBreak: row.sessions_before_long_break,
          soundEnabled: row.sound_enabled !== undefined ? Boolean(row.sound_enabled) : true,
          defaultBreakActivity: (row.default_break_activity as ActivityType | 'ask') || 'ask',
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
      const db = await this.unitOfWork.getDatabase();
      await db.execute(
        `UPDATE timer_settings
         SET work_duration = $1,
             short_break_duration = $2,
             long_break_duration = $3,
             sessions_before_long_break = $4,
             sound_enabled = $5,
             default_break_activity = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          settings.workDuration,
          settings.shortBreakDuration,
          settings.longBreakDuration,
          settings.sessionsBeforeLongBreak,
          settings.soundEnabled ? 1 : 0,
          settings.defaultBreakActivity,
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
