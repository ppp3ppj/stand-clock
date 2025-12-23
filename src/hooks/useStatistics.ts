/**
 * Statistics Hook
 * Manages statistics data loading and calculations
 */

import { createSignal, onMount } from "solid-js";
import { DailyStats, Session } from "../repositories/SessionTrackingRepository";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { getDateString } from "../utils/dateUtils";

export interface StatisticsData {
  weeklyStats: () => DailyStats[];
  allTimeStats: () => {
    totalSessions: number;
    totalFocusHours: number;
    bestFocusScore: number;
  };
  todaySessions: () => Session[];
  isLoading: () => boolean;
}

export interface WeeklyTotals {
  sessions: number;
  workTime: number;
  avgDuration: number;
  mostProductiveDay: DailyStats;
}

/**
 * Custom hook for loading and managing statistics
 */
export function useStatistics(): StatisticsData {
  const [weeklyStats, setWeeklyStats] = createSignal<DailyStats[]>([]);
  const [allTimeStats, setAllTimeStats] = createSignal({
    totalSessions: 0,
    totalFocusHours: 0,
    bestFocusScore: 0,
  });
  const [todaySessions, setTodaySessions] = createSignal<Session[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    try {
      const unitOfWork = createUnitOfWork();
      
      // Load weekly stats (last 7 days)
      const startDate = getDateString(6);
      const endDate = getDateString(0);
      const stats = await unitOfWork.sessionTracking.getDateRangeStats(startDate, endDate);
      setWeeklyStats(stats);

      // Load all-time stats
      const allTime = await unitOfWork.sessionTracking.getAllTimeStats();
      setAllTimeStats(allTime);

      // Load today's sessions
      const sessions = await unitOfWork.sessionTracking.getSessionsForDate(getDateString(0));
      setTodaySessions(sessions);

      await unitOfWork.dispose();
    } catch (error) {
      console.error("[useStatistics] Failed to load statistics:", error);
    } finally {
      setIsLoading(false);
    }
  });

  return {
    weeklyStats,
    allTimeStats,
    todaySessions,
    isLoading,
  };
}

/**
 * Calculate weekly totals from daily stats
 * @param weeklyStats - Array of daily statistics
 */
export function calculateWeeklyTotals(weeklyStats: DailyStats[]): WeeklyTotals {
  const sessions = weeklyStats.reduce((sum, day) => sum + day.workSessionsCompleted, 0);
  const workTime = weeklyStats.reduce((sum, day) => sum + day.totalWorkTime, 0);
  const completedSessions = weeklyStats.reduce((sum, day) => sum + day.workSessionsCompleted, 0);
  
  return {
    sessions,
    workTime,
    avgDuration: completedSessions > 0 ? workTime / completedSessions : 0,
    mostProductiveDay: weeklyStats.reduce(
      (max, day) => day.workSessionsCompleted > max.workSessionsCompleted ? day : max,
      weeklyStats[0] || { date: '', workSessionsCompleted: 0 } as DailyStats
    ),
  };
}
