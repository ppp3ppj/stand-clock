/**
 * Session Info Component
 * Displays current session information and statistics
 */

import { Component, Show } from "solid-js";
import { DailyStats } from "../repositories/SessionTrackingRepository";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface SessionInfoProps {
  mode: TimerMode;
  sessionCount: number;
  todayStats: DailyStats;
  sessionsBeforeLongBreak: number;
}

const SessionInfo: Component<SessionInfoProps> = (props) => {
  const sessionsUntilBreak = () => {
    return props.sessionsBeforeLongBreak - (props.sessionCount % props.sessionsBeforeLongBreak);
  };

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
      <div class="flex justify-center items-center gap-4 text-center">
        <div>
          <div class="text-xs opacity-60 uppercase">Session</div>
          <div class="text-2xl font-bold text-primary">#{props.sessionCount + 1}</div>
        </div>
        <div class="divider divider-horizontal m-0" />
        <div>
          <div class="text-xs opacity-60 uppercase">This Session</div>
          <div class="text-2xl font-bold text-primary">{props.sessionCount}</div>
        </div>
        <div class="divider divider-horizontal m-0" />
        <div>
          <div class="text-xs opacity-60 uppercase">Today</div>
          <div class="text-2xl font-bold text-primary">{props.todayStats.workSessionsCompleted}</div>
        </div>
        <div class="divider divider-horizontal m-0" />
        <div>
          <div class="text-xs opacity-60 uppercase">Until Break</div>
          <div class="text-2xl font-bold text-primary">{sessionsUntilBreak()}</div>
        </div>
      </div>
    </Show>
  );
};

export default SessionInfo;
