import { createSignal, onCleanup, Show } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

function HomePage() {
  const { settings } = useTimerSettings();

  // Timer state
  const [mode, setMode] = createSignal<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);

  let intervalId: number | null = null;

  // Initialize timer with current mode duration
  const initializeTimer = (selectedMode: TimerMode) => {
    const durations = {
      pomodoro: settings().workDuration * 60,
      shortBreak: settings().shortBreakDuration * 60,
      longBreak: settings().longBreakDuration * 60,
    };
    setTimeLeft(durations[selectedMode]);
    setIsRunning(false);
  };

  // Initialize on mount
  initializeTimer(mode());

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start/Pause timer
  const toggleTimer = () => {
    if (isRunning()) {
      // Pause
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setIsRunning(false);
    } else {
      // Start
      setIsRunning(true);
      intervalId = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer completed
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
            }
            setIsRunning(false);

            // Handle session completion
            if (mode() === "pomodoro") {
              const newSessionCount = sessionCount() + 1;
              setSessionCount(newSessionCount);

              // Auto-switch to break
              if (newSessionCount % settings().sessionsBeforeLongBreak === 0) {
                switchMode("longBreak");
              } else {
                switchMode("shortBreak");
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Reset timer
  const resetTimer = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsRunning(false);
    initializeTimer(mode());
  };

  // Switch mode
  const switchMode = (newMode: TimerMode) => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setMode(newMode);
    setIsRunning(false);
    initializeTimer(newMode);
  };

  // Skip to next phase
  const skipToNext = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsRunning(false);

    if (mode() === "pomodoro") {
      // Complete the pomodoro session and move to break
      const newSessionCount = sessionCount() + 1;
      setSessionCount(newSessionCount);

      if (newSessionCount % settings().sessionsBeforeLongBreak === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      // From break, go back to pomodoro
      switchMode("pomodoro");
    }
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
      pomodoro: settings().workDuration * 60,
      shortBreak: settings().shortBreakDuration * 60,
      longBreak: settings().longBreakDuration * 60,
    };
    const total = durations[mode()];
    return total > 0 ? ((total - timeLeft()) / total) * 100 : 0;
  };

  return (
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="card bg-base-200/50 backdrop-blur-sm shadow-2xl w-full max-w-lg">
        <div class="card-body p-8 gap-6">
          {/* Mode Selection Tabs */}
          <div class="flex justify-center gap-2">
            <button
              class={`btn btn-sm ${mode() === "pomodoro" ? "btn-primary" : "btn-ghost"} normal-case`}
              onClick={() => switchMode("pomodoro")}
            >
              Pomodoro
            </button>
            <button
              class={`btn btn-sm ${mode() === "shortBreak" ? "btn-primary" : "btn-ghost"} normal-case`}
              onClick={() => switchMode("shortBreak")}
            >
              Short Break
            </button>
            <button
              class={`btn btn-sm ${mode() === "longBreak" ? "btn-primary" : "btn-ghost"} normal-case`}
              onClick={() => switchMode("longBreak")}
            >
              Long Break
            </button>
          </div>

          {/* Massive Timer Display */}
          <div class="text-center py-8">
            <div class="text-9xl font-bold tabular-nums tracking-tight">
              {formatTime(timeLeft())}
            </div>
          </div>

          {/* Progress Bar */}
          <progress
            class="progress progress-primary w-full h-2"
            value={getProgress()}
            max="100"
          />

          {/* Control Buttons */}
          <div class="flex justify-center gap-3">
            <button
              class={`btn btn-wide ${isRunning() ? "btn-warning" : "btn-primary"} text-lg font-semibold uppercase`}
              onClick={toggleTimer}
            >
              {isRunning() ? "PAUSE" : "START"}
            </button>
            <button
              class="btn btn-square btn-ghost"
              onClick={resetTimer}
              title="Reset"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              </svg>
            </button>
            <button
              class="btn btn-square btn-ghost"
              onClick={skipToNext}
              title="Skip to next phase"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 4l10 8-10 8V4z"/>
                <path d="M19 5v14"/>
              </svg>
            </button>
          </div>

          {/* Session Info */}
          <Show
            when={mode() === "pomodoro"}
            fallback={
              <div class="text-center py-2">
                <div class="badge badge-primary badge-lg">
                  {mode() === "shortBreak" && "Time for a short break!"}
                  {mode() === "longBreak" && "Enjoy your long break!"}
                </div>
              </div>
            }
          >
            <div class="flex justify-center items-center gap-6 text-center">
              <div>
                <div class="text-xs opacity-60 uppercase">Session</div>
                <div class="text-2xl font-bold text-primary">#{sessionCount() + 1}</div>
              </div>
              <div class="divider divider-horizontal m-0" />
              <div>
                <div class="text-xs opacity-60 uppercase">Completed</div>
                <div class="text-2xl font-bold text-primary">{sessionCount()}</div>
              </div>
              <div class="divider divider-horizontal m-0" />
              <div>
                <div class="text-xs opacity-60 uppercase">Until Break</div>
                <div class="text-2xl font-bold text-primary">
                  {settings().sessionsBeforeLongBreak - (sessionCount() % settings().sessionsBeforeLongBreak)}
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
