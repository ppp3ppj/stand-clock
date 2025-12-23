import Database from '@tauri-apps/plugin-sql';
import { IUnitOfWork } from './IUnitOfWork';
import { ITimerSettingsRepository } from './TimerSettingsRepository';
import { SqliteTimerSettingsRepository } from './TimerSettingsRepository';
import { ISessionTrackingRepository } from './SessionTrackingRepository';
import { SqliteSessionTrackingRepository } from './SessionTrackingRepository';

/**
 * SQLite implementation of Unit of Work pattern
 * Manages database connection and coordinates repository operations
 */
export class SqliteUnitOfWork implements IUnitOfWork {
  private db: Database | null = null;
  private readonly dbPath: string;
  private isInTransaction = false;

  // Lazy-loaded repositories
  private _timerSettingsRepository?: ITimerSettingsRepository;
  private _sessionTrackingRepository?: ISessionTrackingRepository;

  constructor(dbPath: string = 'sqlite:standclock.db') {
    this.dbPath = dbPath;
  }

  /**
   * Get timer settings repository
   */
  get timerSettings(): ITimerSettingsRepository {
    if (!this._timerSettingsRepository) {
      this._timerSettingsRepository = new SqliteTimerSettingsRepository(this);
    }
    return this._timerSettingsRepository;
  }

  /**
   * Get session tracking repository
   */
  get sessionTracking(): ISessionTrackingRepository {
    if (!this._sessionTrackingRepository) {
      this._sessionTrackingRepository = new SqliteSessionTrackingRepository(this);
    }
    return this._sessionTrackingRepository;
  }

  async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await Database.load(this.dbPath);
      console.log('[SqliteUnitOfWork] Database connection established');
    }
    return this.db;
  }

  async beginTransaction(): Promise<void> {
    const db = await this.getDatabase();
    await db.execute('BEGIN TRANSACTION');
    this.isInTransaction = true;
    console.log('[SqliteUnitOfWork] Transaction started');
  }

  async commit(): Promise<void> {
    if (!this.isInTransaction) {
      throw new Error('No active transaction to commit');
    }

    const db = await this.getDatabase();
    await db.execute('COMMIT');
    this.isInTransaction = false;
    console.log('[SqliteUnitOfWork] Transaction committed');
  }

  async rollback(): Promise<void> {
    if (!this.isInTransaction) {
      console.warn('[SqliteUnitOfWork] No active transaction to rollback');
      return;
    }

    const db = await this.getDatabase();
    await db.execute('ROLLBACK');
    this.isInTransaction = false;
    console.log('[SqliteUnitOfWork] Transaction rolled back');
  }

  async executeInTransaction<T>(work: () => Promise<T>): Promise<T> {
    await this.beginTransaction();

    try {
      const result = await work();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      console.error('[SqliteUnitOfWork] Transaction failed, rolled back:', error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    if (this.isInTransaction) {
      await this.rollback();
    }

    if (this.db) {
      // Note: Tauri SQL plugin doesn't have explicit close method
      // Connection will be cleaned up by the plugin
      this.db = null;
      console.log('[SqliteUnitOfWork] Database connection disposed');
    }
  }
}

/**
 * Factory function to create a Unit of Work
 */
export function createUnitOfWork(dbPath?: string): IUnitOfWork {
  return new SqliteUnitOfWork(dbPath);
}
