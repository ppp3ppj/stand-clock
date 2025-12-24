import { createSignal, onCleanup, Show } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import clickSound from "../assets/sounds/click1.ogg";
import notificationSound from "../assets/sounds/mixkit-notification-bell-592.wav";
import popAlertSound from "../assets/sounds/mixkit-message-pop-alert-2354.mp3";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

function HomePage() {
  const { settings } = useTimerSettings();

  // Timer state
  const [mode, setMode] = createSignal<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);

  let intervalId: number | null = null;

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

  // Initialize on mount
  initializeTimer(mode());

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Start/Pause timer
  const toggleTimer = () => {
    playClickSound(); // Play click sound on every toggle

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

            // Play notification sound
            playNotificationSound();

            // Handle session completion - use setTimeout to ensure state updates complete
            setTimeout(() => {
              if (mode() === "pomodoro") {
                const newSessionCount = sessionCount() + 1;
                setSessionCount(newSessionCount);

                // Auto-switch to break after state updates
                if (newSessionCount % settings().sessionsBeforeLongBreak === 0) {
                  switchMode("longBreak");
                } else {
                  switchMode("shortBreak");
                }
              } else {
                // Break finished, switch back to pomodoro
                switchMode("pomodoro");
              }
            }, 0);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Reset timer
  const resetTimer = () => {
    playPopAlertSound(); // Play pop alert sound

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
    playPopAlertSound(); // Play pop alert sound

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
      pomodoro: Math.round(settings().workDuration * 60),
      shortBreak: Math.round(settings().shortBreakDuration * 60),
      longBreak: Math.round(settings().longBreakDuration * 60),
    };
    const total = durations[mode()];
    return total > 0 ? ((total - timeLeft()) / total) * 100 : 0;
  };

  return (
    <div class="h-full flex flex-col items-center justify-center px-6 py-8">
      {/* Mode Selection Tabs */}
      <div class="flex gap-2 mb-8">
        <button
          class={`btn btn-sm ${mode() === "pomodoro" ? "btn-primary" : "btn-ghost"} normal-case px-6`}
          onClick={() => switchMode("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          class={`btn btn-sm ${mode() === "shortBreak" ? "btn-primary" : "btn-ghost"} normal-case px-6`}
          onClick={() => switchMode("shortBreak")}
        >
          Short Break
        </button>
        <button
          class={`btn btn-sm ${mode() === "longBreak" ? "btn-primary" : "btn-ghost"} normal-case px-6`}
          onClick={() => switchMode("longBreak")}
        >
          Long Break
        </button>
      </div>

      {/* Massive Timer Display */}
      <div class="text-center mb-8">
        <div class="text-9xl font-bold tabular-nums tracking-tight">
          {formatTime(timeLeft())}
        </div>
      </div>

      {/* Progress Bar */}
      <div class="w-full max-w-md mb-8">
        <progress
          class="progress progress-primary w-full h-2"
          value={getProgress()}
          max="100"
        />
      </div>

      {/* Control Buttons */}
      <div class="flex justify-center gap-3 mb-6">
        <button
          class={`btn ${isRunning() ? "btn-warning" : "btn-primary"} btn-lg px-12 text-lg font-semibold uppercase`}
          onClick={toggleTimer}
        >
          {isRunning() ? "PAUSE" : "START"}
        </button>
        <button
          class="btn btn-square btn-ghost btn-lg"
          onClick={resetTimer}
          title="Reset"
        >
          <i class="ri-restart-line text-2xl"></i>
        </button>
        <button
          class="btn btn-square btn-ghost btn-lg"
          onClick={skipToNext}
          title="Skip to next phase"
        >
          <i class="ri-skip-forward-fill text-2xl"></i>
        </button>
      </div>

      {/* Session Info - Fixed Height */}
      <div class="h-20 flex items-center justify-center">
        <Show
          when={mode() === "pomodoro"}
          fallback={
            <div class="text-center">
              <div class="badge badge-primary badge-lg px-6 py-4 text-base">
                {mode() === "shortBreak" && "Time for a short break!"}
                {mode() === "longBreak" && "Enjoy your long break!"}
              </div>
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
  );
}

export default HomePage;
