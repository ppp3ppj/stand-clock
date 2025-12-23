/**
 * Statistics Card Components
 * Reusable card components for displaying statistics
 */

import { Component, For } from "solid-js";
import { DailyStats } from "../repositories/SessionTrackingRepository";
import { formatTimeHoursMinutes } from "../utils/timeUtils";
import { formatDateDisplay } from "../utils/dateUtils";

interface TodaySummaryCardProps {
  todayStats: DailyStats;
  streakInfo: { currentStreak: number; longestStreak: number; lastActivityDate: string | null };
}

export const TodaySummaryCard: Component<TodaySummaryCardProps> = (props) => {
  return (
    <div class="card bg-base-200 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">
          <i class="ri-calendar-line"></i>
          Today's Summary
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="ri-checkbox-circle-line"
            title="Completed"
            value={props.todayStats.workSessionsCompleted}
            description="work sessions"
            color="primary"
          />
          <StatCard
            icon="ri-time-line"
            title="Focus Time"
            value={formatTimeHoursMinutes(props.todayStats.totalWorkTime)}
            description="total work time"
            color="secondary"
          />
          <StatCard
            icon="ri-percent-line"
            title="Completion"
            value={`${props.todayStats.completionRate}%`}
            description="of started sessions"
            color="accent"
          />
          <StatCard
            icon="ri-fire-line"
            title="Streak"
            value={props.streakInfo.currentStreak}
            description="consecutive days"
            color="warning"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

export const StatCard: Component<StatCardProps> = (props) => {
  return (
    <div class="stat bg-base-300 rounded-lg">
      <div class={`stat-figure text-${props.color}`}>
        <i class={`${props.icon} text-3xl`}></i>
      </div>
      <div class="stat-title">{props.title}</div>
      <div class={`stat-value text-${props.color}`}>{props.value}</div>
      <div class="stat-desc">{props.description}</div>
    </div>
  );
};

interface WeeklyOverviewCardProps {
  weeklyStats: DailyStats[];
}

export const WeeklyOverviewCard: Component<WeeklyOverviewCardProps> = (props) => {
  const weeklyTotals = () => {
    const stats = props.weeklyStats;
    const sessions = stats.reduce((sum, day) => sum + day.workSessionsCompleted, 0);
    const workTime = stats.reduce((sum, day) => sum + day.totalWorkTime, 0);
    const mostProductiveDay = stats.reduce(
      (max, day) => (day.workSessionsCompleted > max.workSessionsCompleted ? day : max),
      stats[0] || { date: "", workSessionsCompleted: 0 }
    );

    return { sessions, workTime, mostProductiveDay };
  };

  return (
    <div class="card bg-base-200 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">
          <i class="ri-calendar-week-line"></i>
          Last 7 Days
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="stat bg-base-300 rounded-lg">
            <div class="stat-title">Total Sessions</div>
            <div class="stat-value text-primary">{weeklyTotals().sessions}</div>
            <div class="stat-desc">this week</div>
          </div>

          <div class="stat bg-base-300 rounded-lg">
            <div class="stat-title">Total Work Time</div>
            <div class="stat-value text-secondary">{formatTimeHoursMinutes(weeklyTotals().workTime)}</div>
            <div class="stat-desc">focus hours</div>
          </div>

          <div class="stat bg-base-300 rounded-lg">
            <div class="stat-title">Most Productive</div>
            <div class="stat-value text-accent text-2xl">
              {formatDateDisplay(weeklyTotals().mostProductiveDay.date)}
            </div>
            <div class="stat-desc">{weeklyTotals().mostProductiveDay.workSessionsCompleted} sessions</div>
          </div>
        </div>

        {/* Weekly Chart Table */}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sessions</th>
                <th>Work Time</th>
                <th>Breaks</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.weeklyStats}>
                {(day) => (
                  <tr>
                    <td class="font-medium">{formatDateDisplay(day.date)}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-primary">{day.workSessionsCompleted}</span>
                        {day.workSessionsSkipped > 0 && (
                          <span class="text-xs opacity-50">({day.workSessionsSkipped} skipped)</span>
                        )}
                      </div>
                    </td>
                    <td>{formatTimeHoursMinutes(day.totalWorkTime)}</td>
                    <td>{day.breakSessionsCompleted}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <progress
                          class="progress progress-primary w-20"
                          value={day.completionRate}
                          max="100"
                        ></progress>
                        <span class="text-sm">{day.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AllTimeStatsCardProps {
  allTimeStats: {
    totalSessions: number;
    totalFocusHours: number;
    bestFocusScore: number;
  };
  streakInfo: { currentStreak: number; longestStreak: number; lastActivityDate: string | null };
}

export const AllTimeStatsCard: Component<AllTimeStatsCardProps> = (props) => {
  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">
          <i class="ri-trophy-line"></i>
          All-Time Statistics
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon="ri-checkbox-circle-line"
            title="Total Sessions"
            value={props.allTimeStats.totalSessions}
            description="completed ever"
            color="primary"
          />
          <StatCard
            icon="ri-time-line"
            title="Total Focus Hours"
            value={`${props.allTimeStats.totalFocusHours}h`}
            description="all-time work time"
            color="secondary"
          />
          <StatCard
            icon="ri-fire-line"
            title="Longest Streak"
            value={props.streakInfo.longestStreak}
            description="consecutive days"
            color="warning"
          />
        </div>
      </div>
    </div>
  );
};
