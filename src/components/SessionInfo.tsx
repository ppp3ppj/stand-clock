/**
 * Session Info Component
 * Displays current session information and statistics
 */

import { Component, Show } from "solid-js";
import { DailyStats } from "../repositories/SessionTrackingRepository";
import SettingsBadge from "./SettingsBadge";
import SessionCountBadge from "./SessionCountBadge";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import { useSessionTracking } from "../contexts/SessionTrackingContext";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface SessionInfoProps {
  mode: TimerMode;
  sessionCount: number;
  todayStats: DailyStats;
  sessionsBeforeLongBreak: number;
}

const SessionInfo: Component<SessionInfoProps> = (props) => {
  const { settings } = useTimerSettings();
  const { sessionsWithCurrentSettings } = useSessionTracking();

  return (
    <Show
      when={props.mode === "pomodoro"}
      fallback={
        <div class="text-center py-2">
          <div class="badge badge-primary badge-lg">
            {props.mode === "shortBreak" && "Time for a short break!"}
            {props.mode === "longBreak" && "Enjoy your long break!"}
          </div>
        </div>
      }
    >
      <div class="flex flex-col gap-3 items-center">
        <SessionCountBadge
          currentSession={props.sessionCount}
          sessionsBeforeLongBreak={props.sessionsBeforeLongBreak}
          totalCompletedWithSettings={sessionsWithCurrentSettings()}
        />

        <SettingsBadge
          workDuration={settings().workDuration}
          shortBreakDuration={settings().shortBreakDuration}
          longBreakDuration={settings().longBreakDuration}
        />

        <div class="stats stats-horizontal shadow">
          <div class="stat py-2 px-4">
            <div class="stat-title text-xs">Session</div>
            <div class="stat-value text-2xl text-primary">#{props.sessionCount + 1}</div>
          </div>
          <div class="stat py-2 px-4">
            <div class="stat-title text-xs">Today</div>
            <div class="stat-value text-2xl text-primary">{props.todayStats.workSessionsCompleted}</div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default SessionInfo;
