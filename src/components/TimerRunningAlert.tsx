/**
 * Timer Running Alert Component
 * Shows a warning banner when timer is running on other pages
 */

import { Component, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useSessionTracking } from "../contexts/SessionTrackingContext";

export const TimerRunningAlert: Component = () => {
  const { isTimerRunning, currentMode } = useSessionTracking();
  const navigate = useNavigate();

  const handleReturnToTimer = () => {
    navigate("/");
  };

  return (
    <Show when={isTimerRunning()}>
      <div class="alert alert-warning shadow-lg mb-6">
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div class="flex-1">
            <h3 class="font-bold">Timer is Running</h3>
            <div class="text-xs">
              Your {currentMode() === "pomodoro" ? "work session" : "break"} timer is currently active.
              Timer will continue in the background.
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onClick={handleReturnToTimer}>
            <i class="ri-arrow-left-line"></i>
            Return to Timer
          </button>
        </div>
      </div>
    </Show>
  );
};
