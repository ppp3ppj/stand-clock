/**
 * Home Page Component
 * Main timer page with pomodoro functionality
 * Refactored following OOP, DRY, and clean code principles
 */

import { createSignal, createEffect } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import { useSessionTracking } from "../contexts/SessionTrackingContext";
import { usePomodoroSession } from "../hooks/usePomodoroSession";
import { useSoundEffects } from "../hooks/useSoundEffects";
import BreakActivitySelector from "../components/BreakActivitySelector";
import ModeSelector from "../components/ModeSelector";
import TimerDisplay from "../components/TimerDisplay";
import TimerControls from "../components/TimerControls";
import SessionInfo from "../components/SessionInfo";
import StreakBadge from "../components/StreakBadge";
import SettingsChangeAlert from "../components/SettingsChangeAlert";

function HomePage() {
  const { settings } = useTimerSettings();
  const { todayStats, streakInfo } = useSessionTracking();

  // Initialize sound effects
  const { playClick, playNotification, playPopAlert } = useSoundEffects(() => settings().soundEnabled);

  // Initialize pomodoro session management
  const session = usePomodoroSession(playNotification, playPopAlert);

  // Settings change tracking
  const [hasSettingsChanged, setHasSettingsChanged] = createSignal(false);
  const [lastSessionSettings, setLastSessionSettings] = createSignal<{
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  } | null>(null);

  // Detect settings changes
  createEffect(() => {
    const current = settings();
    const last = lastSessionSettings();

    if (last && (
      last.workDuration !== current.workDuration ||
      last.shortBreakDuration !== current.shortBreakDuration ||
      last.longBreakDuration !== current.longBreakDuration ||
      last.sessionsBeforeLongBreak !== current.sessionsBeforeLongBreak
    )) {
      setHasSettingsChanged(true);
    }
  });

  // When session starts, save settings as last used
  createEffect(() => {
    if (session.isRunning() && session.hasSessionStarted()) {
      setLastSessionSettings({
        workDuration: settings().workDuration,
        shortBreakDuration: settings().shortBreakDuration,
        longBreakDuration: settings().longBreakDuration,
        sessionsBeforeLongBreak: settings().sessionsBeforeLongBreak,
      });
      setHasSettingsChanged(false);
    }
  });

  // Wrapper functions to add sound effects
  const handleToggle = () => {
    playClick();
    session.toggleTimer();
  };

  const handleReset = () => {
    session.resetTimer();
  };

  const handleSkip = () => {
    session.skipToNext();
  };

  const handleModeChange = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    playClick();
    session.switchMode(newMode);
  };

  return (
    <div class="min-h-screen flex items-center justify-center p-4">
      {/* Break Activity Selector Modal */}
      <BreakActivitySelector
        isOpen={session.showBreakActivitySelector()}
        onSelect={session.handleBreakActivitySelect}
        onClose={session.closeBreakActivitySelector}
      />

      <div class="card bg-base-200/50 backdrop-blur-sm shadow-2xl w-full max-w-lg relative">
        {/* Streak Badge */}
        <StreakBadge streakInfo={streakInfo()} />

        <div class="card-body p-8 gap-6">
          {/* Settings Change Alert */}
          <SettingsChangeAlert hasSettingsChanged={hasSettingsChanged()} />

          {/* Mode Selection Tabs */}
          <ModeSelector
            currentMode={session.mode()}
            onModeChange={handleModeChange}
          />

          {/* Timer Display */}
          <TimerDisplay timeLeft={session.timeLeft()} />

          {/* Progress Bar */}
          <progress
            class="progress progress-primary w-full h-2"
            value={session.getProgress()}
            max="100"
          />

          {/* Control Buttons */}
          <TimerControls
            isRunning={session.isRunning()}
            onToggle={handleToggle}
            onReset={handleReset}
            onSkip={handleSkip}
          />

          {/* Session Info */}
          <SessionInfo
            mode={session.mode()}
            sessionCount={session.sessionCount()}
            todayStats={todayStats()}
            sessionsBeforeLongBreak={settings().sessionsBeforeLongBreak}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
