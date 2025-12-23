/**
 * Streak Badge Component
 * Displays the current streak count
 */

import { Component, Show } from "solid-js";
import { StreakInfo } from "../repositories/SessionTrackingRepository";

interface StreakBadgeProps {
  streakInfo: StreakInfo;
}

const StreakBadge: Component<StreakBadgeProps> = (props) => {
  return (
    <Show when={props.streakInfo.currentStreak > 0}>
      <div class="absolute -top-3 -right-3 z-10">
        <div class="badge badge-primary badge-lg gap-2 px-4 py-3 shadow-lg">
          <i class="ri-fire-line text-lg"></i>
          <span class="font-bold">{props.streakInfo.currentStreak}</span>
          <span class="text-xs opacity-80">
            day{props.streakInfo.currentStreak !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Show>
  );
};

export default StreakBadge;
