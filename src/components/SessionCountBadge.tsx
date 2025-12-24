import { Component, Show } from "solid-js";

interface SessionCountBadgeProps {
  currentSession: number;
  sessionsBeforeLongBreak: number;
  totalCompletedWithSettings?: number;
}

const SessionCountBadge: Component<SessionCountBadgeProps> = (props) => {
  const progress = () => {
    const inCycle = props.currentSession % props.sessionsBeforeLongBreak;
    return inCycle === 0 ? props.sessionsBeforeLongBreak : inCycle;
  };

  return (
    <div class="flex gap-2 items-center flex-wrap">
      <div class="badge badge-primary gap-2">
        <i class="ri-focus-3-line"></i>
        <span class="font-bold">
          {progress()}/{props.sessionsBeforeLongBreak}
        </span>
        <span class="text-xs">sessions</span>
      </div>

      <Show when={props.totalCompletedWithSettings !== undefined}>
        <div class="badge badge-secondary badge-outline gap-2">
          <i class="ri-checkbox-circle-line"></i>
          <span>{props.totalCompletedWithSettings} with current settings</span>
        </div>
      </Show>
    </div>
  );
};

export default SessionCountBadge;
