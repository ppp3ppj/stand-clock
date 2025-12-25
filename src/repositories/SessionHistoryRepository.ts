import { IUnitOfWork } from "./IUnitOfWork";

export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';
export type SessionEventType = 'completed' | 'skipped' | 'manual_switch';

export interface SessionHistoryEntry {
  id?: number;
  sessionType: SessionType;
  eventType: SessionEventType;
  timestamp: string; // ISO 8601 format
  duration: number; // actual seconds run before event
  expectedDuration: number; // configured duration in seconds
  sessionNumber?: number; // only for pomodoro sessions
}

export interface ISessionHistoryRepository {
  /**
   * Add a new session history entry
   */
  addEntry(entry: Omit<SessionHistoryEntry, 'id'>): Promise<number>;

  /**
   * Get entries by date range
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<SessionHistoryEntry[]>;

  /**
   * Get recent entries (limited)
   */
  getRecent(limit: number): Promise<SessionHistoryEntry[]>;

  /**
   * Get entries for today
   */
  getToday(): Promise<SessionHistoryEntry[]>;

  /**
   * Get entries for current week (Mon-Sun)
   */
  getThisWeek(): Promise<SessionHistoryEntry[]>;

  /**
   * Get entries for current month
   */
  getThisMonth(): Promise<SessionHistoryEntry[]>;

  /**
   * Get all entries
   */
  getAll(): Promise<SessionHistoryEntry[]>;

  /**
   * Delete entry by ID
   */
  delete(id: number): Promise<void>;

  /**
   * Clear all history
   */
  clearAll(): Promise<void>;
}

export class SqliteSessionHistoryRepository implements ISessionHistoryRepository {
  constructor(private unitOfWork: IUnitOfWork) {}

  async addEntry(entry: Omit<SessionHistoryEntry, 'id'>): Promise<number> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.execute(
        `INSERT INTO session_history
         (session_type, event_type, timestamp, duration, expected_duration, session_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          entry.sessionType,
          entry.eventType,
          entry.timestamp,
          entry.duration,
          entry.expectedDuration,
          entry.sessionNumber ?? null,
        ]
      );
      console.log("[SessionHistoryRepository] Entry added:", entry);
      return result.lastInsertId;
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to add entry:", error);
      throw error;
    }
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<SessionHistoryEntry[]> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{
        id: number;
        session_type: string;
        event_type: string;
        timestamp: string;
        duration: number;
        expected_duration: number;
        session_number: number | null;
      }>>(
        `SELECT * FROM session_history
         WHERE timestamp >= $1 AND timestamp < $2
         ORDER BY timestamp DESC`,
        [startDate.toISOString(), endDate.toISOString()]
      );

      return this.mapRows(result);
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to get by date range:", error);
      throw error;
    }
  }

  async getRecent(limit: number): Promise<SessionHistoryEntry[]> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<any>>(
        `SELECT * FROM session_history ORDER BY timestamp DESC LIMIT $1`,
        [limit]
      );
      return this.mapRows(result);
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to get recent:", error);
      throw error;
    }
  }

  async getToday(): Promise<SessionHistoryEntry[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    return this.getByDateRange(startOfDay, endOfDay);
  }

  async getThisWeek(): Promise<SessionHistoryEntry[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return this.getByDateRange(startOfWeek, endOfWeek);
  }

  async getThisMonth(): Promise<SessionHistoryEntry[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.getByDateRange(startOfMonth, endOfMonth);
  }

  async getAll(): Promise<SessionHistoryEntry[]> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<any>>(
        `SELECT * FROM session_history ORDER BY timestamp DESC`
      );
      return this.mapRows(result);
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to get all:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const db = await this.unitOfWork.getDatabase();
      await db.execute(`DELETE FROM session_history WHERE id = $1`, [id]);
      console.log("[SessionHistoryRepository] Entry deleted:", id);
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to delete entry:", error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.unitOfWork.getDatabase();
      await db.execute(`DELETE FROM session_history`);
      console.log("[SessionHistoryRepository] All entries cleared");
    } catch (error) {
      console.error("[SessionHistoryRepository] Failed to clear all:", error);
      throw error;
    }
  }

  private mapRows(rows: any[]): SessionHistoryEntry[] {
    return rows.map(row => ({
      id: row.id,
      sessionType: row.session_type as SessionType,
      eventType: row.event_type as SessionEventType,
      timestamp: row.timestamp,
      duration: row.duration,
      expectedDuration: row.expected_duration,
      sessionNumber: row.session_number ?? undefined,
    }));
  }
}
