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
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="flex flex-col items-center text-center gap-4">
          {/* Mode Selection Tabs */}
          <div role="tablist" class="tabs tabs-boxed w-full">
            <button
              role="tab"
              class={`tab flex-1 ${mode() === "pomodoro" ? "tab-active" : ""}`}
              onClick={() => switchMode("pomodoro")}
            >
              Pomodoro
            </button>
            <button
              role="tab"
              class={`tab flex-1 ${mode() === "shortBreak" ? "tab-active" : ""}`}
              onClick={() => switchMode("shortBreak")}
            >
              Short Break
            </button>
            <button
              role="tab"
              class={`tab flex-1 ${mode() === "longBreak" ? "tab-active" : ""}`}
              onClick={() => switchMode("longBreak")}
            >
              Long Break
            </button>
          </div>

          {/* Timer Display */}
          <div class="bg-primary rounded-2xl p-8 w-full">
            <div class="text-8xl font-bold text-primary-content tabular-nums">
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
          <div class="flex gap-3 w-full">
            <button
              class={`btn ${isRunning() ? "btn-warning" : "btn-success"} flex-1`}
              onClick={toggleTimer}
            >
              {isRunning() ? "PAUSE" : "START"}
            </button>
            <button
              class="btn btn-outline flex-1"
              onClick={resetTimer}
            >
              RESET
            </button>
          </div>

          {/* Session Counter */}
          <Show when={mode() === "pomodoro"}>
            <div class="text-center w-full">
              <div class="text-sm opacity-70">Session #{sessionCount() + 1}</div>
              <div class="text-5xl font-bold text-primary my-2">{sessionCount()}</div>
              <div class="text-xs opacity-60">
                {settings().sessionsBeforeLongBreak - (sessionCount() % settings().sessionsBeforeLongBreak)} until long break
              </div>
            </div>
          </Show>

          {/* Mode Description */}
          <div class="alert alert-info py-2 px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="stroke-current shrink-0 w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm">
              {mode() === "pomodoro" && "Time to focus!"}
              {mode() === "shortBreak" && "Take a short break!"}
              {mode() === "longBreak" && "Enjoy your long break!"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
