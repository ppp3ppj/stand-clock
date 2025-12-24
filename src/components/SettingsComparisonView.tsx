import { Component, createSignal, For, onMount, Show } from "solid-js";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import SettingsBadge from "./SettingsBadge";

interface SettingsGroup {
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };
  stats: {
    totalSessions: number;
    completedSessions: number;
    averageCompletionRate: number;
    totalWorkTime: number;
  };
}

const SettingsComparisonView: Component = () => {
  const [groups, setGroups] = createSignal<SettingsGroup[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const unitOfWork = createUnitOfWork();

  onMount(async () => {
    try {
      const db = await unitOfWork.getDatabase();
      const configs = await db.select<Array<{
        work_duration: number;
        short_break_duration: number;
        long_break_duration: number;
        sessions_before_long_break: number;
      }>>(
        `SELECT DISTINCT work_duration, short_break_duration,
                long_break_duration, sessions_before_long_break
         FROM sessions
         WHERE work_duration IS NOT NULL
         ORDER BY work_duration, short_break_duration`
      );

      const groupsData = await Promise.all(
        configs.map(async (config) => {
          const stats = await unitOfWork.sessionTracking.getStatsForSettings(
            config.work_duration,
            config.short_break_duration,
            config.long_break_duration,
            config.sessions_before_long_break
          );
          return {
            settings: {
              workDuration: config.work_duration,
              shortBreakDuration: config.short_break_duration,
              longBreakDuration: config.long_break_duration,
              sessionsBeforeLongBreak: config.sessions_before_long_break,
            },
            stats,
          };
        })
      );

      setGroups(groupsData);
    } catch (err) {
      console.error("Failed to load settings groups:", err);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">
          <i class="ri-pie-chart-line"></i>
          Performance by Settings
        </h2>

        <Show when={isLoading()}>
          <div class="text-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        </Show>

        <Show when={!isLoading() && groups().length === 0}>
          <div class="text-center py-8 opacity-60">
            <i class="ri-information-line text-4xl mb-2"></i>
            <p>No sessions with settings data yet</p>
            <p class="text-sm">Complete sessions to see comparison</p>
          </div>
        </Show>

        <Show when={!isLoading() && groups().length > 0}>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>Settings Configuration</th>
                  <th>Total Sessions</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                  <th>Total Work Time</th>
                </tr>
              </thead>
              <tbody>
                <For each={groups()}>
                  {(group) => (
                    <tr>
                      <td>
                        <SettingsBadge
                          workDuration={group.settings.workDuration}
                          shortBreakDuration={group.settings.shortBreakDuration}
                          longBreakDuration={group.settings.longBreakDuration}
                        />
                        <div class="text-xs opacity-60 mt-1">
                          {group.settings.sessionsBeforeLongBreak} sessions/long break
                        </div>
                      </td>
                      <td class="font-bold">{group.stats.totalSessions}</td>
                      <td class="text-primary font-bold">{group.stats.completedSessions}</td>
                      <td>
                        <div class="flex items-center gap-2">
                          <progress
                            class="progress progress-primary w-20"
                            value={group.stats.averageCompletionRate}
                            max="100"
                          />
                          <span>{Math.round(group.stats.averageCompletionRate)}%</span>
                        </div>
                      </td>
                      <td>{Math.round(group.stats.totalWorkTime / 3600 * 10) / 10}h</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SettingsComparisonView;
