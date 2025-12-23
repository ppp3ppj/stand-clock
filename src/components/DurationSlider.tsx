/**
 * Duration Slider Component
 * Reusable component for duration selection with presets and custom range
 */

import { Component, For } from "solid-js";
import { formatMinutesAsMMSS } from "../utils/timeUtils";

interface DurationSliderProps {
  title: string;
  description: string;
  value: number;
  presets: number[];
  min: number;
  max: number;
  step: number;
  badgeColor: "primary" | "secondary" | "accent" | "neutral";
  rangeColor: "primary" | "secondary" | "accent" | "neutral";
  onValueChange: (value: number) => void;
  recommendation?: string;
}

export const DurationSlider: Component<DurationSliderProps> = (props) => {
  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="card-title text-2xl mb-1">{props.title}</h2>
            <p class="text-sm text-base-content/70">{props.description}</p>
          </div>
          <div class={`badge badge-${props.badgeColor} badge-lg`}>{props.value} min</div>
        </div>

        {/* Quick Presets */}
        <div class="mb-4">
          <label class="label">
            <span class="label-text font-semibold">Quick Presets</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <For each={props.presets}>
              {(preset) => (
                <button
                  class={`btn ${
                    props.value === preset
                      ? `btn-${props.badgeColor}`
                      : `btn-outline btn-${props.badgeColor}`
                  }`}
                  onClick={() => props.onValueChange(preset)}
                >
                  {preset} min
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Custom Range Slider */}
        <div class="mb-4">
          <label class="label">
            <span class="label-text font-semibold">Custom Duration</span>
            <span class="label-text-alt">{formatMinutesAsMMSS(props.value)}</span>
          </label>
          <input
            type="range"
            min={props.min}
            max={props.max}
            value={props.value}
            class={`range range-${props.rangeColor}`}
            step={props.step}
            onInput={(e) => props.onValueChange(parseInt(e.currentTarget.value))}
          />
          <div class="flex justify-between text-xs px-2 mt-1 text-base-content/60">
            <span>{props.min} min</span>
            <span>{Math.floor((props.min + props.max) / 2)} min</span>
            <span>{props.max} min</span>
          </div>
        </div>

        {/* Recommendation/Info */}
        {props.recommendation && (
          <div class="alert alert-info">
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
            <span class="text-sm">{props.recommendation}</span>
          </div>
        )}
      </div>
    </div>
  );
};
