/**
 * Sound Settings Component
 * Manages sound notification preferences
 */

import { Component, Show } from "solid-js";

interface SoundSettingsProps {
  soundEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onTestSound: () => void;
}

export const SoundSettings: Component<SoundSettingsProps> = (props) => {
  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="card-title text-2xl mb-1">Sound Notification</h2>
            <p class="text-sm text-base-content/70">Play a sound when timer completes</p>
          </div>
        </div>

        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              class="toggle toggle-primary toggle-lg"
              checked={props.soundEnabled}
              onChange={(e) => props.onToggle(e.currentTarget.checked)}
            />
            <span class="label-text text-lg">
              {props.soundEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div class="alert alert-info mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-current shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-sm">
            A notification sound will play when your work session or break ends
          </span>
        </div>

        <Show when={props.soundEnabled}>
          <div class="mt-4">
            <button class="btn btn-outline btn-primary gap-2" onClick={props.onTestSound}>
              <i class="ri-volume-up-line text-xl"></i>
              Test Sound
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};
