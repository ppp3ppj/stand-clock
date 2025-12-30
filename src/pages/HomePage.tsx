import { createSignal, onCleanup, createEffect, Show } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import { useSessionHistory } from "../contexts/SessionHistoryContext";
import { useEyeCare } from "../contexts/EyeCareContext";
import { ActivityType } from "../repositories/SessionHistoryRepository";
import ActivitySelectionDialog from "../components/ActivitySelectionDialog";
import EyeCareOverlay from "../components/EyeCareOverlay";
import EyeCareIndicator from "../components/EyeCareIndicator";
import clickSound from "../assets/sounds/click1.ogg";
import notificationSound from "../assets/sounds/mixkit-notification-bell-592.wav";
import popAlertSound from "../assets/sounds/mixkit-message-pop-alert-2354.mp3";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

function HomePage() {
  const { settings, isLoading } = useTimerSettings();
  const { addEntry } = useSessionHistory();
  const eyeCare = useEyeCare();

  // Timer state
  const [mode, setMode] = createSignal<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = createSignal(0); // Track actual elapsed time
  const [showActivityDialog, setShowActivityDialog] = createSignal(false);
  const [currentBreakType, setCurrentBreakType] = createSignal<'shortBreak' | 'longBreak'>('shortBreak');
  const [selectedActivity, setSelectedActivity] = createSignal<ActivityType | null>(null);
  const [modeChangeKey, setModeChangeKey] = createSignal(0); // Trigger animation on mode change

  let intervalId: number | null = null;
  let processingLock = false; // Synchronous lock to prevent double-click
  let debounceTimer: number | null = null;

  // Play click sound for button actions
  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.volume = 0.37;
    audio.play().catch(err => console.log("Audio play failed:", err));
  };

  // Play pop alert sound for reset/skip actions
  const playPopAlertSound = () => {
    const audio = new Audio(popAlertSound);
    audio.volume = 0.27;
    audio.play().catch(err => console.log("Pop alert sound play failed:", err));
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (settings().soundEnabled) {
      const audio = new Audio(notificationSound);
      audio.volume = 0.6;
      audio.play().catch(err => console.log("Notification sound play failed:", err));
    }
  };

  // Initialize timer with current mode duration
  const initializeTimer = (selectedMode: TimerMode) => {
    const durations = {
      pomodoro: Math.round(settings().workDuration * 60),
      shortBreak: Math.round(settings().shortBreakDuration * 60),
      longBreak: Math.round(settings().longBreakDuration * 60),
    };
    setTimeLeft(durations[selectedMode]);
    setIsRunning(false);
  };

  // Initialize timer when settings finish loading
  createEffect(() => {
    if (!isLoading()) {
      console.log('[HomePage] Settings loaded, initializing timer with:', settings());
      initializeTimer(mode());
    }
  });

  // Notify EyeCare context when mode changes
  createEffect(() => {
    eyeCare.onPomodoroModeChange(mode());
  });

  // Helper function to get duration for a mode
  const getDurationForMode = (m: TimerMode): number => {
    const durations = {
      pomodoro: Math.round(settings().workDuration * 60),
      shortBreak: Math.round(settings().shortBreakDuration * 60),
      longBreak: Math.round(settings().longBreakDuration * 60),
    };
    return durations[m];
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start/Pause timer
  const toggleTimer = () => {
    // Prevent double-click with synchronous lock and debounce
    if (processingLock) return;

    // Clear any existing debounce timer
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }

    processingLock = true;
    playClickSound(); // Play click sound on every toggle

    if (isRunning()) {
      // Pause - accumulate elapsed time
      if (startTime()) {
        const sessionElapsed = Math.round((Date.now() - startTime()!) / 1000);
        setElapsedSeconds(elapsedSeconds() + sessionElapsed);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setIsRunning(false);
      setStartTime(null);

      // Notify EyeCare context
      eyeCare.onPomodoroPause();
    } else {
      // Start/Resume - record when timer started
      setStartTime(Date.now());
      setIsRunning(true);

      // Notify EyeCare context
      eyeCare.onPomodoroStart();
      intervalId = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
            }
            setIsRunning(false);

            // Calculate final elapsed time
            const sessionElapsed = startTime()
              ? Math.round((Date.now() - startTime()!) / 1000)
              : 0;
            const totalElapsed = elapsedSeconds() + sessionElapsed;

            // Play notification sound
            playNotificationSound();

            // Handle session completion - use setTimeout to ensure state updates complete
            setTimeout(() => {
              if (mode() === "pomodoro") {
                // Track pomodoro completion
                addEntry({
                  sessionType: mode(),
                  eventType: 'completed',
                  timestamp: new Date().toISOString(),
                  duration: totalElapsed,
                  expectedDuration: getDurationForMode(mode()),
                  sessionNumber: sessionCount() + 1,
                }).catch(err => console.error("Failed to track completion:", err));

                const newSessionCount = sessionCount() + 1;
                setSessionCount(newSessionCount);

                // Auto-switch to break after state updates
                const nextMode = newSessionCount % settings().sessionsBeforeLongBreak === 0
                  ? "longBreak"
                  : "shortBreak";

                // Show activity selection dialog for breaks (or auto-set if default configured)
                setCurrentBreakType(nextMode);
                const defaultActivity = settings().defaultBreakActivity;
                if (defaultActivity === 'ask') {
                  setShowActivityDialog(true);
                  setSelectedActivity(null);
                } else {
                  // Use default activity without showing popup
                  setSelectedActivity(defaultActivity);
                  setShowActivityDialog(false);
                }

                // Reset elapsed time tracker
                setElapsedSeconds(0);
                setStartTime(null);

                switchMode(nextMode);
              } else {
                // Break finished, track with selected activity and switch back to pomodoro
                addEntry({
                  sessionType: mode(),
                  eventType: 'completed',
                  timestamp: new Date().toISOString(),
                  duration: totalElapsed,
                  expectedDuration: getDurationForMode(mode()),
                  activityType: selectedActivity() ?? undefined,
                }).catch(err => console.error("Failed to track break completion:", err));

                // Reset elapsed time tracker
                setElapsedSeconds(0);
                setStartTime(null);

                // Reset activity selection for next break
                setSelectedActivity(null);
                switchMode("pomodoro");
              }
            }, 0);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Reset processing lock with debounce
    debounceTimer = window.setTimeout(() => {
      processingLock = false;
      debounceTimer = null;
    }, 300);
  };

  // Reset timer
  const resetTimer = () => {
    playPopAlertSound(); // Play pop alert sound

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsRunning(false);
    setStartTime(null);
    setElapsedSeconds(0);
    initializeTimer(mode());
  };

  // Switch mode
  const switchMode = async (newMode: TimerMode) => {
    // If timer was running or had accumulated time, this is a manual switch
    if ((isRunning() && startTime()) || elapsedSeconds() > 0) {
      const sessionElapsed = startTime()
        ? Math.round((Date.now() - startTime()!) / 1000)
        : 0;
      const totalElapsed = elapsedSeconds() + sessionElapsed;

      if (totalElapsed > 0) {
        await addEntry({
          sessionType: mode(),
          eventType: 'manual_switch',
          timestamp: new Date().toISOString(),
          duration: totalElapsed,
          expectedDuration: getDurationForMode(mode()),
          sessionNumber: mode() === 'pomodoro' ? sessionCount() + 1 : undefined,
          activityType: mode() !== 'pomodoro' ? selectedActivity() ?? undefined : undefined,
        }).catch(err => console.error("Failed to track manual switch:", err));
      }
    }

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setMode(newMode);
    setModeChangeKey(prev => prev + 1); // Trigger animation
    setIsRunning(false);
    setStartTime(null);
    setElapsedSeconds(0);

    // Show activity dialog when manually switching to a break (or auto-set if default configured)
    if (newMode !== 'pomodoro') {
      setCurrentBreakType(newMode);
      const defaultActivity = settings().defaultBreakActivity;
      if (defaultActivity === 'ask') {
        setShowActivityDialog(true);
        setSelectedActivity(null);
      } else {
        // Use default activity without showing popup
        setSelectedActivity(defaultActivity);
        setShowActivityDialog(false);
      }
    }

    initializeTimer(newMode);
  };

  // Skip to next phase
  const skipToNext = async () => {
    playPopAlertSound(); // Play pop alert sound

    // Track skip event - include accumulated time from pauses
    const sessionElapsed = startTime()
      ? Math.round((Date.now() - startTime()!) / 1000)
      : 0;
    const totalElapsed = elapsedSeconds() + sessionElapsed;

    await addEntry({
      sessionType: mode(),
      eventType: 'skipped',
      timestamp: new Date().toISOString(),
      duration: totalElapsed,
      expectedDuration: getDurationForMode(mode()),
      sessionNumber: mode() === 'pomodoro' ? sessionCount() + 1 : undefined,
      activityType: mode() !== 'pomodoro' ? selectedActivity() ?? undefined : undefined,
    }).catch(err => console.error("Failed to track skip:", err));

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsRunning(false);
    setStartTime(null);
    setElapsedSeconds(0);

    if (mode() === "pomodoro") {
      // Complete the pomodoro session and move to break
      const newSessionCount = sessionCount() + 1;
      setSessionCount(newSessionCount);

      const nextMode = newSessionCount % settings().sessionsBeforeLongBreak === 0
        ? "longBreak"
        : "shortBreak";

      // Show activity selection dialog for breaks (or auto-set if default configured)
      setCurrentBreakType(nextMode);
      const defaultActivity = settings().defaultBreakActivity;
      if (defaultActivity === 'ask') {
        setShowActivityDialog(true);
        setSelectedActivity(null);
      } else {
        // Use default activity without showing popup
        setSelectedActivity(defaultActivity);
        setShowActivityDialog(false);
      }
      switchMode(nextMode);
    } else {
      // From break, go back to pomodoro
      setSelectedActivity(null);
      switchMode("pomodoro");
    }
  };

  // Handle activity selection
  const handleActivitySelect = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setShowActivityDialog(false);
  };

  // Handle skip activity selection
  const handleActivitySkip = () => {
    setSelectedActivity(null);
    setShowActivityDialog(false);
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  // Calculate progress percentage
  const getProgress = () => {
    const durations = {
      pomodoro: Math.round(settings().workDuration * 60),
      shortBreak: Math.round(settings().shortBreakDuration * 60),
      longBreak: Math.round(settings().longBreakDuration * 60),
    };
    const total = durations[mode()];
    return total > 0 ? ((total - timeLeft()) / total) * 100 : 0;
  };

  return (
    <>
      {/* Activity Selection Dialog */}
      <ActivitySelectionDialog
        isOpen={showActivityDialog()}
        breakType={currentBreakType()}
        onSelect={handleActivitySelect}
        onSkip={handleActivitySkip}
      />

      {/* Eye Care Overlay */}
      <EyeCareOverlay
        isOpen={eyeCare.isBreakActive()}
        countdown={eyeCare.breakTimeLeft()}
        onDismiss={eyeCare.dismissBreak}
        onSnooze={eyeCare.snooze}
      />

      <div class="h-full flex flex-col items-center justify-center px-6 py-8">
        {/* Mode Selection Tabs */}
        <div class="flex gap-2 mb-8">
          <button
            class={`btn btn-sm ${mode() === "pomodoro" ? "btn-primary" : "btn-ghost"} normal-case px-6 transition-all duration-300`}
            onClick={() => switchMode("pomodoro")}
          >
            Pomodoro
          </button>
          <button
            class={`btn btn-sm ${mode() === "shortBreak" ? "btn-primary" : "btn-ghost"} normal-case px-6 transition-all duration-300`}
            onClick={() => switchMode("shortBreak")}
          >
            Short Break
          </button>
          <button
            class={`btn btn-sm ${mode() === "longBreak" ? "btn-primary" : "btn-ghost"} normal-case px-6 transition-all duration-300`}
            onClick={() => switchMode("longBreak")}
          >
            Long Break
          </button>
        </div>

        {/* Massive Timer Display */}
        <div class="text-center mb-8">
          <div
            class="text-9xl font-bold tabular-nums tracking-tight"
            classList={{
              'animate-timerPulse': modeChangeKey() > 0
            }}
            style={{
              transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out'
            }}
          >
            {formatTime(timeLeft())}
          </div>
        </div>

        {/* Progress Bar */}
        <div class="w-full max-w-md mb-8">
          <progress
            class="progress progress-primary w-full h-2 transition-all duration-300"
            value={getProgress()}
            max="100"
          />
        </div>

        {/* Control Buttons */}
        <div class="flex justify-center gap-3 mb-6">
          <button
            class={`btn ${isRunning() ? "btn-warning" : "btn-primary"} btn-lg px-12 text-xl font-semibold uppercase min-w-[220px]`}
            onClick={toggleTimer}
          >
            {isRunning() ? "PAUSE" : "START"}
          </button>
          <button
            class="btn btn-square btn-ghost btn-lg transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={resetTimer}
            title="Reset"
          >
            <i class="ri-restart-line text-2xl"></i>
          </button>
          <button
            class="btn btn-square btn-ghost btn-lg transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={skipToNext}
            title="Skip to next phase"
          >
            <i class="ri-skip-forward-fill text-2xl"></i>
          </button>
        </div>

        {/* Session Info - Fixed Height */}
        <div class="h-20 flex items-center justify-center transition-all duration-500">
          <Show
            when={mode() === "pomodoro"}
            fallback={
              <div class="text-center">
                <div class="badge badge-primary badge-lg px-6 py-4 text-base">
                  {mode() === "shortBreak" && "Time for a short break!"}
                  {mode() === "longBreak" && "Enjoy your long break!"}
                </div>
                <Show when={selectedActivity()}>
                  <div class="text-sm opacity-70 mt-2">
                    Activity: {selectedActivity()}
                  </div>
                </Show>
              </div>
            }
          >
            <div class="flex justify-center items-center gap-8 text-center">
              <div>
                <div class="text-xs opacity-60 uppercase mb-1">Session</div>
                <div class="text-3xl font-bold text-primary">#{sessionCount() + 1}</div>
              </div>
              <div class="divider divider-horizontal m-0 h-12" />
              <div>
                <div class="text-xs opacity-60 uppercase mb-1">Completed</div>
                <div class="text-3xl font-bold text-primary">{sessionCount()}</div>
              </div>
              <div class="divider divider-horizontal m-0 h-12" />
              <div>
                <div class="text-xs opacity-60 uppercase mb-1">Until Break</div>
                <div class="text-3xl font-bold text-primary">
                  {settings().sessionsBeforeLongBreak - (sessionCount() % settings().sessionsBeforeLongBreak)}
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Eye Care Indicator */}
      <EyeCareIndicator
        isEnabled={settings().eyeCareEnabled}
        isActive={isRunning() && mode() === 'pomodoro'}
        timeUntilBreak={eyeCare.timeUntilBreak()}
        isSnoozed={eyeCare.isSnoozed()}
        snoozeTimeLeft={eyeCare.snoozeTimeLeft()}
      />
    </>
  );
}

export default HomePage;
