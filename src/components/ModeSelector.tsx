/**
 * Mode Selector Component
 * Allows switching between pomodoro, short break, and long break modes
 */

import { Component } from "solid-js";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
}

const ModeSelector: Component<ModeSelectorProps> = (props) => {
  return (
    <div class="flex justify-center gap-2">
      <button
        class={`btn btn-sm ${props.currentMode === "pomodoro" ? "btn-primary" : "btn-ghost"} normal-case`}
        onClick={() => props.onModeChange("pomodoro")}
      >
        Pomodoro
      </button>
      <button
        class={`btn btn-sm ${props.currentMode === "shortBreak" ? "btn-primary" : "btn-ghost"} normal-case`}
        onClick={() => props.onModeChange("shortBreak")}
      >
        Short Break
      </button>
      <button
        class={`btn btn-sm ${props.currentMode === "longBreak" ? "btn-primary" : "btn-ghost"} normal-case`}
        onClick={() => props.onModeChange("longBreak")}
      >
        Long Break
      </button>
    </div>
  );
};

export default ModeSelector;
