/**
 * Timer Controls Component
 * Displays timer control buttons (start/pause, reset, skip)
 */

import { Component } from "solid-js";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const TimerControls: Component<TimerControlsProps> = (props) => {
  return (
    <div class="flex justify-center gap-3">
      <button
        class={`btn btn-wide ${props.isRunning ? "btn-warning" : "btn-primary"} text-lg font-semibold uppercase`}
        onClick={props.onToggle}
      >
        {props.isRunning ? "PAUSE" : "START"}
      </button>
      <button
        class="btn btn-square btn-ghost"
        onClick={props.onReset}
        title="Reset"
      >
        <i class="ri-restart-line text-2xl"></i>
      </button>
      <button
        class="btn btn-square btn-ghost"
        onClick={props.onSkip}
        title="Skip to next phase"
      >
        <i class="ri-skip-forward-fill text-2xl"></i>
      </button>
    </div>
  );
};

export default TimerControls;
