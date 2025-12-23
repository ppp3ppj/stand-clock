/**
 * Session Cycle Visualizer Component
 * Visualizes the pomodoro work/break cycle
 */

import { Component } from "solid-js";

interface SessionCycleVisualizerProps {
  sessionsBeforeLongBreak: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  onSessionsChange: (count: number) => void;
}

export const SessionCycleVisualizer: Component<SessionCycleVisualizerProps> = (props) => {
  const totalCycleTime = () => {
    return (
      props.workDuration * props.sessionsBeforeLongBreak +
      props.shortBreakDuration * (props.sessionsBeforeLongBreak - 1) +
      props.longBreakDuration
    );
  };

  const sessionPresets = [2, 3, 4, 5, 6, 8];

  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="card-title text-2xl mb-1">Sessions Before Long Break</h2>
            <p class="text-sm text-base-content/70">
              Number of work sessions before taking a long break
            </p>
          </div>
          <div class="badge badge-neutral badge-lg">{props.sessionsBeforeLongBreak} sessions</div>
        </div>

        {/* Session Counter Buttons */}
        <div class="mb-4">
          <label class="label">
            <span class="label-text font-semibold">Select Sessions</span>
          </label>
          <div class="flex flex-wrap gap-2">
            {sessionPresets.map((count) => (
              <button
                class={`btn ${
                  props.sessionsBeforeLongBreak === count
                    ? "btn-neutral"
                    : "btn-outline btn-neutral"
                }`}
                onClick={() => props.onSessionsChange(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Visualization */}
        <div class="mb-4">
          <label class="label">
            <span class="label-text font-semibold">Progress Preview</span>
            <span class="label-text-alt">Example cycle</span>
          </label>
          <div class="flex items-center gap-2 flex-wrap">
            {Array.from({ length: props.sessionsBeforeLongBreak }).map((_, index) => (
              <>
                <div class="badge badge-primary badge-lg gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Work
                </div>
                {index < props.sessionsBeforeLongBreak - 1 && (
                  <>
                    <span class="text-base-content/50">→</span>
                    <div class="badge badge-secondary">Short Break</div>
                    <span class="text-base-content/50">→</span>
                  </>
                )}
              </>
            ))}
            <span class="text-base-content/50">→</span>
            <div class="badge badge-accent badge-lg gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Long Break
            </div>
          </div>
        </div>

        {/* Total Cycle Time Info */}
        <div class="stats shadow bg-base-100">
          <div class="stat">
            <div class="stat-title">Total Cycle Time</div>
            <div class="stat-value text-2xl">{totalCycleTime()} min</div>
            <div class="stat-desc">
              {Math.floor(totalCycleTime() / 60)}h {totalCycleTime() % 60}m per complete cycle
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
