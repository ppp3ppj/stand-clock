/**
 * Session Tracking Context
 * Manages session tracking with database persistence
 * Improved with better error handling and separation of concerns
 */

import { createContext, useContext, createSignal, onMount, onCleanup, ParentComponent } from "solid-js";
import { IUnitOfWork } from "../repositories/IUnitOfWork";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { Session, DailyStats, StreakInfo, DEFAULT_DAILY_STATS, SessionSettingsSnapshot } from "../repositories/SessionTrackingRepository";
import { getTodayDateString, calculateDuration } from "../utils/dateUtils";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface ActiveSession {
  type: TimerMode;
  plannedDuration: number;  // in seconds
  startedAt: Date;
  settingsSnapshot: SessionSettingsSnapshot;
}

interface SessionTrackingContextValue {
  // Active session
  activeSession: () => ActiveSession | null;
  startSession: (type: TimerMode, plannedDuration: number, settingsSnapshot: SessionSettingsSnapshot) => void;
  completeSession: () => Promise<void>;
  skipSession: () => Promise<void>;
  abandonSession: () => Promise<void>;

  // Break activity
  breakActivity: () => string | null;
  selectBreakActivity: (activity: string) => void;

  // Timer state (for persistence across navigation)
  currentMode: () => TimerMode;
  setCurrentMode: (mode: TimerMode) => void;
  timeLeft: () => number;
  setTimeLeft: (time: number) => void;
  isTimerRunning: () => boolean;
  setIsTimerRunning: (running: boolean) => void;
  sessionCount: () => number;
  setSessionCount: (count: number) => void;
  wasRunningBeforeLeave: () => boolean;
  setWasRunningBeforeLeave: (running: boolean) => void;

  // Stats
  todayStats: () => DailyStats;
  streakInfo: () => StreakInfo;
  refreshTodayStats: () => Promise<void>;
  refreshStreak: () => Promise<void>;

  // Settings tracking
  sessionsWithCurrentSettings: () => number;
  refreshSessionsCount: () => Promise<void>;

  isLoading: () => boolean;
  error: () => string | null;
}

const SessionTrackingContext = createContext<SessionTrackingContextValue>();

interface SessionTrackingProviderProps {
  unitOfWork?: IUnitOfWork;
}

/**
 * Provider for session tracking with database persistence
 * Tracks active sessions, records completions, and manages statistics
 */
export const SessionTrackingProvider: ParentComponent<SessionTrackingProviderProps> = (props) => {
  // Use injected Unit of Work or create default one
  const unitOfWork = props.unitOfWork ?? createUnitOfWork();

  const [activeSession, setActiveSession] = createSignal<ActiveSession | null>(null);
  const [breakActivity, setBreakActivity] = createSignal<string | null>(null);
  const [todayStats, setTodayStats] = createSignal<DailyStats>({
    ...DEFAULT_DAILY_STATS,
    date: getTodayDateString(),
  });
  const [streakInfo, setStreakInfo] = createSignal<StreakInfo>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Timer state (persistent across navigation)
  const [currentMode, setCurrentMode] = createSignal<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isTimerRunning, setIsTimerRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);
  const [wasRunningBeforeLeave, setWasRunningBeforeLeave] = createSignal(false);
  const [sessionsWithCurrentSettings, setSessionsWithCurrentSettings] = createSignal(0);

  // Load initial data on mount
  onMount(async () => {
    try {
      await Promise.all([refreshTodayStats(), refreshStreak(), refreshSessionsCount()]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load initial data";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

  // Cleanup on unmount
  onCleanup(async () => {
    try {
      await unitOfWork.dispose();
    } catch (err) {
      console.error("[SessionTrackingContext] Cleanup error:", err);
    }
  });

  const startSession = (type: TimerMode, plannedDuration: number, settingsSnapshot: SessionSettingsSnapshot) => {
    setActiveSession({
      type,
      plannedDuration,
      startedAt: new Date(),
      settingsSnapshot,
    });

    // Reset break activity when starting a new break session
    if (type !== 'pomodoro') {
      setBreakActivity(null);
    }

    console.log(`[SessionTrackingContext] Started ${type} session`);
  };

  const completeSession = async () => {
    const session = activeSession();
    if (!session) {
      console.warn("[SessionTrackingContext] No active session to complete");
      return;
    }

    try {
      const completedAt = new Date();
      const actualDuration = calculateDuration(session.startedAt, completedAt);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'completed',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
        breakActivity: session.type !== 'pomodoro' ? breakActivity() || undefined : undefined,
        workDuration: session.settingsSnapshot.workDuration,
        shortBreakDuration: session.settingsSnapshot.shortBreakDuration,
        longBreakDuration: session.settingsSnapshot.longBreakDuration,
        sessionsBeforeLongBreak: session.settingsSnapshot.sessionsBeforeLongBreak,
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await Promise.all([refreshTodayStats(), refreshStreak(), refreshSessionsCount()]);
      setError(null);

      console.log("[SessionTrackingContext] Session completed and recorded");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete session";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const skipSession = async () => {
    const session = activeSession();
    if (!session) {
      console.warn("[SessionTrackingContext] No active session to skip");
      return;
    }

    try {
      const completedAt = new Date();
      const actualDuration = calculateDuration(session.startedAt, completedAt);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'skipped',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
        breakActivity: session.type !== 'pomodoro' ? breakActivity() || undefined : undefined,
        workDuration: session.settingsSnapshot.workDuration,
        shortBreakDuration: session.settingsSnapshot.shortBreakDuration,
        longBreakDuration: session.settingsSnapshot.longBreakDuration,
        sessionsBeforeLongBreak: session.settingsSnapshot.sessionsBeforeLongBreak,
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await refreshTodayStats();
      setError(null);

      console.log("[SessionTrackingContext] Session skipped and recorded");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to skip session";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const abandonSession = async () => {
    const session = activeSession();
    if (!session) {
      console.warn("[SessionTrackingContext] No active session to abandon");
      return;
    }

    try {
      const completedAt = new Date();
      const actualDuration = calculateDuration(session.startedAt, completedAt);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'abandoned',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
        workDuration: session.settingsSnapshot.workDuration,
        shortBreakDuration: session.settingsSnapshot.shortBreakDuration,
        longBreakDuration: session.settingsSnapshot.longBreakDuration,
        sessionsBeforeLongBreak: session.settingsSnapshot.sessionsBeforeLongBreak,
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await refreshTodayStats();
      setError(null);

      console.log("[SessionTrackingContext] Session abandoned and recorded");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to abandon session";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const selectBreakActivity = (activity: string) => {
    setBreakActivity(activity);
    console.log(`[SessionTrackingContext] Break activity selected: ${activity}`);
  };

  const refreshTodayStats = async () => {
    try {
      const stats = await unitOfWork.sessionTracking.getDailyStats(getTodayDateString());
      setTodayStats(stats);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh today's stats";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const refreshStreak = async () => {
    try {
      const streak = await unitOfWork.sessionTracking.getCurrentStreak();
      setStreakInfo(streak);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh streak";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  };

  const refreshSessionsCount = async () => {
    try {
      const settings = await unitOfWork.timerSettings.load();
      const snapshot: SessionSettingsSnapshot = {
        workDuration: settings.workDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
      };
      const count = await unitOfWork.sessionTracking.getSessionsCountForCurrentSettings(snapshot);
      setSessionsWithCurrentSettings(count);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh sessions count";
      console.error("[SessionTrackingContext] " + errorMessage, err);
      setError(errorMessage);
    }
  };

  const value: SessionTrackingContextValue = {
    activeSession,
    startSession,
    completeSession,
    skipSession,
    abandonSession,
    breakActivity,
    selectBreakActivity,
    currentMode,
    setCurrentMode,
    timeLeft,
    setTimeLeft,
    isTimerRunning,
    setIsTimerRunning,
    sessionCount,
    setSessionCount,
    wasRunningBeforeLeave,
    setWasRunningBeforeLeave,
    todayStats,
    streakInfo,
    refreshTodayStats,
    refreshStreak,
    sessionsWithCurrentSettings,
    refreshSessionsCount,
    isLoading,
    error,
  };

  return (
    <SessionTrackingContext.Provider value={value}>
      {props.children}
    </SessionTrackingContext.Provider>
  );
};

export const useSessionTracking = () => {
  const context = useContext(SessionTrackingContext);
  if (!context) {
    throw new Error("useSessionTracking must be used within a SessionTrackingProvider");
  }
  return context;
};

// Re-export types for convenience
export type { Session, DailyStats, StreakInfo, TimerMode };
