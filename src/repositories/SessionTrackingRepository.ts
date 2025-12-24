import { IUnitOfWork } from './IUnitOfWork';

export interface Session {
  id?: number;
  sessionType: 'pomodoro' | 'shortBreak' | 'longBreak';
  status: 'completed' | 'skipped' | 'abandoned';
  plannedDuration: number;  // in seconds
  actualDuration: number;   // in seconds
  startedAt: Date;
  completedAt: Date;
  date: string;  // YYYY-MM-DD
  breakActivity?: string;
  // Settings snapshot - what settings were active when this session ran
  workDuration?: number;         // in minutes
  shortBreakDuration?: number;   // in minutes
  longBreakDuration?: number;    // in minutes
  sessionsBeforeLongBreak?: number;
}

export interface SessionSettingsSnapshot {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface DailyStats {
  date: string;
  workSessionsCompleted: number;
  workSessionsSkipped: number;
  breakSessionsCompleted: number;
  breakSessionsSkipped: number;
  totalSessionsStarted: number;
  totalWorkTime: number;
  totalBreakTime: number;
  totalStandingTime: number;
  totalExerciseTime: number;
  standingBreaks: number;
  walkingBreaks: number;
  stretchingBreaks: number;
  otherBreaks: number;
  completionRate: number;
  focusScore: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export const DEFAULT_DAILY_STATS: DailyStats = {
  date: '',
  workSessionsCompleted: 0,
  workSessionsSkipped: 0,
  breakSessionsCompleted: 0,
  breakSessionsSkipped: 0,
  totalSessionsStarted: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  totalStandingTime: 0,
  totalExerciseTime: 0,
  standingBreaks: 0,
  walkingBreaks: 0,
  stretchingBreaks: 0,
  otherBreaks: 0,
  completionRate: 0,
  focusScore: 0,
};

/**
 * Repository interface for session tracking and statistics
 */
export interface ISessionTrackingRepository {
  /**
   * Record a completed/skipped/abandoned session
   */
  recordSession(session: Session): Promise<void>;

  /**
   * Get daily statistics for a specific date
   */
  getDailyStats(date: string): Promise<DailyStats>;

  /**
   * Get daily statistics for a date range
   */
  getDateRangeStats(startDate: string, endDate: string): Promise<DailyStats[]>;

  /**
   * Get current streak information
   */
  getCurrentStreak(): Promise<StreakInfo>;

  /**
   * Get all-time statistics
   */
  getAllTimeStats(): Promise<{
    totalSessions: number;
    totalFocusHours: number;
    bestFocusScore: number;
  }>;

  /**
   * Get individual sessions for a specific date (for timeline view)
   */
  getSessionsForDate(date: string): Promise<Session[]>;

  /**
   * Count sessions completed under current settings
   */
  getSessionsCountForCurrentSettings(settings: SessionSettingsSnapshot): Promise<number>;

  /**
   * Get aggregated stats for a specific settings configuration
   */
  getStatsForSettings(
    workDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number,
    sessionsBeforeLongBreak: number
  ): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageCompletionRate: number;
    totalWorkTime: number;
  }>;
}

/**
 * SQLite implementation of session tracking repository
 */
export class SqliteSessionTrackingRepository implements ISessionTrackingRepository {
  constructor(private unitOfWork: IUnitOfWork) {}

  async recordSession(session: Session): Promise<void> {
    try {
      const db = await this.unitOfWork.getDatabase();

      // Insert session record
      await db.execute(
        `INSERT INTO sessions (
          session_type, status, planned_duration, actual_duration,
          started_at, completed_at, date, break_activity,
          work_duration, short_break_duration, long_break_duration, sessions_before_long_break
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          session.sessionType,
          session.status,
          session.plannedDuration,
          session.actualDuration,
          session.startedAt.toISOString(),
          session.completedAt.toISOString(),
          session.date,
          session.breakActivity || null,
          session.workDuration || null,
          session.shortBreakDuration || null,
          session.longBreakDuration || null,
          session.sessionsBeforeLongBreak || null,
        ]
      );

      // Update or create daily stats
      await this.updateDailyStats(session.date);

      // Update streak if it's a completed work session
      if (session.sessionType === 'pomodoro' && session.status === 'completed') {
        await this.updateStreak(session.date);
      }

      console.log('[SqliteSessionTrackingRepository] Session recorded successfully');
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to record session:', error);
      throw error;
    }
  }

  async getDailyStats(date: string): Promise<DailyStats> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<any>>(
        "SELECT * FROM daily_stats WHERE date = $1",
        [date]
      );

      if (result.length > 0) {
        return this.mapDailyStatsFromDb(result[0]);
      }

      // Return default stats if no record exists
      return { ...DEFAULT_DAILY_STATS, date };
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get daily stats:', error);
      return { ...DEFAULT_DAILY_STATS, date };
    }
  }

  async getDateRangeStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<any>>(
        "SELECT * FROM daily_stats WHERE date >= $1 AND date <= $2 ORDER BY date ASC",
        [startDate, endDate]
      );

      return result.map(row => this.mapDailyStatsFromDb(row));
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get date range stats:', error);
      return [];
    }
  }

  async getCurrentStreak(): Promise<StreakInfo> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{
        current_streak: number;
        longest_streak: number;
        last_activity_date: string | null;
      }>>("SELECT * FROM streak_info WHERE id = 1");

      if (result.length > 0) {
        const row = result[0];
        return {
          currentStreak: row.current_streak,
          longestStreak: row.longest_streak,
          lastActivityDate: row.last_activity_date,
        };
      }

      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get streak:', error);
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
    }
  }

  async getAllTimeStats(): Promise<{
    totalSessions: number;
    totalFocusHours: number;
    bestFocusScore: number;
  }> {
    try {
      const db = await this.unitOfWork.getDatabase();

      // Get total sessions
      const totalResult = await db.select<Array<{ total: number }>>(
        "SELECT COUNT(*) as total FROM sessions WHERE status = 'completed'"
      );

      // Get total work time (convert to hours)
      const timeResult = await db.select<Array<{ total_time: number }>>(
        "SELECT SUM(total_work_time) as total_time FROM daily_stats"
      );

      // Get best focus score
      const scoreResult = await db.select<Array<{ best_score: number }>>(
        "SELECT MAX(focus_score) as best_score FROM daily_stats"
      );

      return {
        totalSessions: totalResult[0]?.total || 0,
        totalFocusHours: Math.round((timeResult[0]?.total_time || 0) / 3600 * 10) / 10,
        bestFocusScore: Math.round(scoreResult[0]?.best_score || 0),
      };
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get all-time stats:', error);
      return { totalSessions: 0, totalFocusHours: 0, bestFocusScore: 0 };
    }
  }

  async getSessionsForDate(date: string): Promise<Session[]> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{
        id: number;
        session_type: string;
        status: string;
        planned_duration: number;
        actual_duration: number;
        started_at: string;
        completed_at: string;
        date: string;
        break_activity: string | null;
        work_duration: number | null;
        short_break_duration: number | null;
        long_break_duration: number | null;
        sessions_before_long_break: number | null;
      }>>(
        "SELECT * FROM sessions WHERE date = $1 ORDER BY started_at ASC",
        [date]
      );

      return result.map(row => ({
        id: row.id,
        sessionType: row.session_type as 'pomodoro' | 'shortBreak' | 'longBreak',
        status: row.status as 'completed' | 'skipped' | 'abandoned',
        plannedDuration: row.planned_duration,
        actualDuration: row.actual_duration,
        startedAt: new Date(row.started_at),
        completedAt: new Date(row.completed_at),
        date: row.date,
        breakActivity: row.break_activity || undefined,
        workDuration: row.work_duration || undefined,
        shortBreakDuration: row.short_break_duration || undefined,
        longBreakDuration: row.long_break_duration || undefined,
        sessionsBeforeLongBreak: row.sessions_before_long_break || undefined,
      }));
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get sessions for date:', error);
      return [];
    }
  }

  /**
   * Update daily statistics after recording a session
   */
  private async updateDailyStats(date: string): Promise<void> {
    const db = await this.unitOfWork.getDatabase();

    // Get all sessions for this date
    const sessions = await db.select<Array<{
      session_type: string;
      status: string;
      actual_duration: number;
      break_activity: string | null;
    }>>(
      "SELECT session_type, status, actual_duration, break_activity FROM sessions WHERE date = $1",
      [date]
    );

    // Calculate stats
    let workCompleted = 0;
    let workSkipped = 0;
    let breakCompleted = 0;
    let breakSkipped = 0;
    let totalStarted = sessions.length;
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    let totalStandingTime = 0;
    let totalExerciseTime = 0;
    let standingBreaks = 0;
    let walkingBreaks = 0;
    let stretchingBreaks = 0;
    let otherBreaks = 0;

    for (const session of sessions) {
      const isWork = session.session_type === 'pomodoro';
      const isCompleted = session.status === 'completed';

      if (isWork) {
        if (isCompleted) workCompleted++;
        else if (session.status === 'skipped') workSkipped++;
        if (isCompleted) totalWorkTime += session.actual_duration;
      } else {
        if (isCompleted) breakCompleted++;
        else if (session.status === 'skipped') breakSkipped++;
        if (isCompleted) totalBreakTime += session.actual_duration;

        // Track break activities
        if (isCompleted && session.break_activity) {
          const activity = session.break_activity.toLowerCase();
          if (activity === 'standing') {
            standingBreaks++;
            totalStandingTime += session.actual_duration;
          } else if (activity === 'walking') {
            walkingBreaks++;
            totalStandingTime += session.actual_duration;
          } else if (activity === 'stretching') {
            stretchingBreaks++;
            totalExerciseTime += session.actual_duration;
          } else {
            otherBreaks++;
          }
        }
      }
    }

    // Calculate completion rate
    const completionRate = totalStarted > 0
      ? Math.round(((workCompleted + breakCompleted) / totalStarted) * 100)
      : 0;

    // Calculate average session duration vs planned
    let avgDurationRatio = 0;
    if (workCompleted > 0) {
      const avgActualDuration = totalWorkTime / workCompleted;
      const avgPlannedDuration = sessions
        .filter(s => s.session_type === 'pomodoro' && s.status === 'completed')
        .reduce((sum, s) => sum + 1, 0) > 0
        ? sessions
            .filter(s => s.session_type === 'pomodoro' && s.status === 'completed')
            .reduce((sum, s) => sum + s.actual_duration, 0) /
          sessions.filter(s => s.session_type === 'pomodoro' && s.status === 'completed').length
        : 1;
      avgDurationRatio = avgPlannedDuration > 0 ? avgActualDuration / avgPlannedDuration : 1;
    }

    // Calculate abandonment penalty
    const abandonedSessions = sessions.filter(s => s.status === 'abandoned').length;
    const abandonmentPenalty = totalStarted > 0
      ? (1 - (abandonedSessions / totalStarted))
      : 1;

    // Enhanced Focus Score Calculation (0-100)
    // Formula: (completion_rate * 0.4) + (avg_duration_ratio * 40) + (abandonment_penalty * 20)
    const focusScore = totalStarted > 0
      ? Math.round(
          (completionRate * 0.4) +
          (Math.min(avgDurationRatio, 1) * 40) +
          (abandonmentPenalty * 20)
        )
      : 0;

    // Streak day requirements: at least 1 completed work session
    // For stricter requirements, could add: workCompleted >= 4 && totalWorkTime >= 7200 (2 hours)
    const isStreakDay = workCompleted > 0 ? 1 : 0;

    // Insert or update daily stats
    await db.execute(
      `INSERT INTO daily_stats (
        date, work_sessions_completed, work_sessions_skipped,
        break_sessions_completed, break_sessions_skipped, total_sessions_started,
        total_work_time, total_break_time, total_standing_time, total_exercise_time,
        standing_breaks, walking_breaks, stretching_breaks, other_breaks,
        completion_rate, focus_score, is_streak_day, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
      ON CONFLICT(date) DO UPDATE SET
        work_sessions_completed = $2,
        work_sessions_skipped = $3,
        break_sessions_completed = $4,
        break_sessions_skipped = $5,
        total_sessions_started = $6,
        total_work_time = $7,
        total_break_time = $8,
        total_standing_time = $9,
        total_exercise_time = $10,
        standing_breaks = $11,
        walking_breaks = $12,
        stretching_breaks = $13,
        other_breaks = $14,
        completion_rate = $15,
        focus_score = $16,
        is_streak_day = $17,
        updated_at = CURRENT_TIMESTAMP`,
      [
        date, workCompleted, workSkipped, breakCompleted, breakSkipped, totalStarted,
        totalWorkTime, totalBreakTime, totalStandingTime, totalExerciseTime,
        standingBreaks, walkingBreaks, stretchingBreaks, otherBreaks,
        completionRate, focusScore, isStreakDay
      ]
    );
  }

  /**
   * Update streak when a work session is completed
   */
  private async updateStreak(date: string): Promise<void> {
    const db = await this.unitOfWork.getDatabase();

    // Get current streak info
    const streakResult = await db.select<Array<{
      current_streak: number;
      longest_streak: number;
      last_activity_date: string | null;
    }>>("SELECT * FROM streak_info WHERE id = 1");

    if (streakResult.length === 0) return;

    const streakInfo = streakResult[0];
    let newStreak = 1;

    if (streakInfo.last_activity_date) {
      const lastDate = new Date(streakInfo.last_activity_date);
      const currentDate = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, keep current streak
        newStreak = streakInfo.current_streak;
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        newStreak = streakInfo.current_streak + 1;
      } else {
        // Gap in streak, reset to 1
        newStreak = 1;
      }
    }

    // Update longest streak if necessary
    const longestStreak = Math.max(newStreak, streakInfo.longest_streak);

    await db.execute(
      `UPDATE streak_info SET
        current_streak = $1,
        longest_streak = $2,
        last_activity_date = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1`,
      [newStreak, longestStreak, date]
    );
  }

  /**
   * Map database row to DailyStats interface
   */
  private mapDailyStatsFromDb(row: any): DailyStats {
    return {
      date: row.date,
      workSessionsCompleted: row.work_sessions_completed,
      workSessionsSkipped: row.work_sessions_skipped,
      breakSessionsCompleted: row.break_sessions_completed,
      breakSessionsSkipped: row.break_sessions_skipped,
      totalSessionsStarted: row.total_sessions_started,
      totalWorkTime: row.total_work_time,
      totalBreakTime: row.total_break_time,
      totalStandingTime: row.total_standing_time,
      totalExerciseTime: row.total_exercise_time,
      standingBreaks: row.standing_breaks,
      walkingBreaks: row.walking_breaks,
      stretchingBreaks: row.stretching_breaks,
      otherBreaks: row.other_breaks,
      completionRate: row.completion_rate,
      focusScore: row.focus_score,
    };
  }

  async getSessionsCountForCurrentSettings(settings: SessionSettingsSnapshot): Promise<number> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{ count: number }>>(
        `SELECT COUNT(*) as count FROM sessions
         WHERE work_duration = $1 AND short_break_duration = $2
           AND long_break_duration = $3 AND sessions_before_long_break = $4
           AND status = 'completed' AND session_type = 'pomodoro'`,
        [settings.workDuration, settings.shortBreakDuration,
         settings.longBreakDuration, settings.sessionsBeforeLongBreak]
      );
      return result[0]?.count || 0;
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get sessions count for current settings:', error);
      return 0;
    }
  }

  async getStatsForSettings(
    workDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number,
    sessionsBeforeLongBreak: number
  ): Promise<{ totalSessions: number; completedSessions: number; averageCompletionRate: number; totalWorkTime: number; }> {
    try {
      const db = await this.unitOfWork.getDatabase();
      const result = await db.select<Array<{
        total: number;
        completed: number;
        total_time: number;
      }>>(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'completed' AND session_type = 'pomodoro'
              THEN actual_duration ELSE 0 END) as total_time
        FROM sessions
        WHERE work_duration = $1 AND short_break_duration = $2
          AND long_break_duration = $3 AND sessions_before_long_break = $4`,
        [workDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak]
      );

      const row = result[0] || { total: 0, completed: 0, total_time: 0 };
      return {
        totalSessions: row.total,
        completedSessions: row.completed,
        averageCompletionRate: row.total > 0 ? (row.completed / row.total) * 100 : 0,
        totalWorkTime: row.total_time || 0,
      };
    } catch (error) {
      console.error('[SqliteSessionTrackingRepository] Failed to get stats for settings:', error);
      return { totalSessions: 0, completedSessions: 0, averageCompletionRate: 0, totalWorkTime: 0 };
    }
  }
}
