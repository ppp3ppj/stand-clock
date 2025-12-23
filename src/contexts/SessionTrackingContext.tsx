import { createContext, useContext, createSignal, onMount, onCleanup, ParentComponent } from "solid-js";
import { IUnitOfWork } from "../repositories/IUnitOfWork";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { Session, DailyStats, StreakInfo, DEFAULT_DAILY_STATS } from "../repositories/SessionTrackingRepository";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface ActiveSession {
  type: TimerMode;
  plannedDuration: number;  // in seconds
  startedAt: Date;
}

interface SessionTrackingContextValue {
  // Active session
  activeSession: () => ActiveSession | null;
  startSession: (type: TimerMode, plannedDuration: number) => void;
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

  isLoading: () => boolean;
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

  // Timer state (persistent across navigation)
  const [currentMode, setCurrentMode] = createSignal<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isTimerRunning, setIsTimerRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);
  const [wasRunningBeforeLeave, setWasRunningBeforeLeave] = createSignal(false);

  // Get today's date in YYYY-MM-DD format
  function getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Load initial data on mount
  onMount(async () => {
    try {
      await refreshTodayStats();
      await refreshStreak();
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to load initial data:", error);
    } finally {
      setIsLoading(false);
    }
  });

  // Cleanup on unmount
  onCleanup(async () => {
    await unitOfWork.dispose();
  });

  const startSession = (type: TimerMode, plannedDuration: number) => {
    setActiveSession({
      type,
      plannedDuration,
      startedAt: new Date(),
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
      const actualDuration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'completed',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
        breakActivity: session.type !== 'pomodoro' ? breakActivity() || undefined : undefined,
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await refreshTodayStats();
      await refreshStreak();

      console.log("[SessionTrackingContext] Session completed and recorded");
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to complete session:", error);
      throw error;
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
      const actualDuration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'skipped',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
        breakActivity: session.type !== 'pomodoro' ? breakActivity() || undefined : undefined,
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await refreshTodayStats();

      console.log("[SessionTrackingContext] Session skipped and recorded");
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to skip session:", error);
      throw error;
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
      const actualDuration = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

      const sessionRecord: Session = {
        sessionType: session.type,
        status: 'abandoned',
        plannedDuration: session.plannedDuration,
        actualDuration,
        startedAt: session.startedAt,
        completedAt,
        date: getTodayDateString(),
      };

      await unitOfWork.sessionTracking.recordSession(sessionRecord);
      setActiveSession(null);

      // Refresh stats after recording
      await refreshTodayStats();

      console.log("[SessionTrackingContext] Session abandoned and recorded");
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to abandon session:", error);
      throw error;
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
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to refresh today's stats:", error);
    }
  };

  const refreshStreak = async () => {
    try {
      const streak = await unitOfWork.sessionTracking.getCurrentStreak();
      setStreakInfo(streak);
    } catch (error) {
      console.error("[SessionTrackingContext] Failed to refresh streak:", error);
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
    isLoading,
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
