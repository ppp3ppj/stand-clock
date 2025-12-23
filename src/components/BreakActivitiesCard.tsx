/**
 * Break Activities Card Component
 * Displays break activity distribution
 */

import { Component, For, Show } from "solid-js";
import { DailyStats } from "../repositories/SessionTrackingRepository";
import { formatTimeHoursMinutes } from "../utils/timeUtils";

interface BreakActivitiesCardProps {
  todayStats: DailyStats;
}

interface BreakActivity {
  name: string;
  count: number;
  icon: string;
  percent: number;
}

export const BreakActivitiesCard: Component<BreakActivitiesCardProps> = (props) => {
  const breakActivities = (): BreakActivity[] => {
    const stats = props.todayStats;
    const total = stats.standingBreaks + stats.walkingBreaks + stats.stretchingBreaks + stats.otherBreaks;
    
    if (total === 0) return [];

    return [
      {
        name: "Standing",
        count: stats.standingBreaks,
        icon: "ri-user-line",
        percent: (stats.standingBreaks / total) * 100,
      },
      {
        name: "Walking",
        count: stats.walkingBreaks,
        icon: "ri-walk-line",
        percent: (stats.walkingBreaks / total) * 100,
      },
      {
        name: "Stretching",
        count: stats.stretchingBreaks,
        icon: "ri-body-scan-line",
        percent: (stats.stretchingBreaks / total) * 100,
      },
      {
        name: "Other",
        count: stats.otherBreaks,
        icon: "ri-more-2-line",
        percent: (stats.otherBreaks / total) * 100,
      },
    ].filter((activity) => activity.count > 0);
  };

  return (
    <Show when={breakActivities().length > 0}>
      <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <i class="ri-cup-line"></i>
            Today's Break Activities
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <For each={breakActivities()}>
              {(activity) => (
                <div class="card bg-base-300">
                  <div class="card-body items-center text-center p-4">
                    <i class={`${activity.icon} text-4xl text-primary`}></i>
                    <h3 class="font-bold">{activity.name}</h3>
                    <div class="stat-value text-2xl">{activity.count}</div>
                    <div class="text-xs opacity-60">{Math.round(activity.percent)}%</div>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div class="mt-4">
            <div class="flex items-center gap-2 text-sm">
              <i class="ri-time-line"></i>
              <span>Standing/Walking: {formatTimeHoursMinutes(props.todayStats.totalStandingTime)}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="ri-body-scan-line"></i>
              <span>Exercise/Stretching: {formatTimeHoursMinutes(props.todayStats.totalExerciseTime)}</span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
