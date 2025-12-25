import Database from '@tauri-apps/plugin-sql';
import { ITimerSettingsRepository } from './TimerSettingsRepository';
import { ISessionHistoryRepository } from './SessionHistoryRepository';

/**
 * Unit of Work interface for managing database transactions
 * Coordinates repository operations and ensures consistency
 */
export interface IUnitOfWork {
  /**
   * Get the underlying database connection
   */
  getDatabase(): Promise<Database>;

  /**
   * Begin a new transaction
   */
  beginTransaction(): Promise<void>;

  /**
   * Commit the current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   * Automatically commits on success, rolls back on error
   */
  executeInTransaction<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Dispose/cleanup resources
   */
  dispose(): Promise<void>;

  /**
   * Get timer settings repository
   */
  readonly timerSettings: ITimerSettingsRepository;

  /**
   * Get session history repository
   */
  readonly sessionHistory: ISessionHistoryRepository;
}
