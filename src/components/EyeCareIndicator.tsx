import { Component, Show } from 'solid-js';

interface EyeCareIndicatorProps {
  isEnabled: boolean;
  isActive: boolean;
  timeUntilBreak: number;      // Seconds
  isSnoozed: boolean;
  snoozeTimeLeft: number;      // Seconds
}

const EyeCareIndicator: Component<EyeCareIndicatorProps> = (props) => {
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Show when={props.isEnabled}>
      <div class="fixed bottom-6 right-6 z-50">
        <div class="stats shadow-lg bg-base-100 border border-base-300">
          <div class="stat py-3 px-4">
            <div class="stat-figure text-info">
              <i class="ri-eye-line text-2xl"></i>
            </div>
            <div class="stat-title text-xs">Next Eye Break</div>
            <div
              class="stat-value text-2xl tabular-nums"
              classList={{
                'text-info': props.isActive,
                'opacity-40': !props.isActive
              }}
            >
              {formatTime(props.timeUntilBreak)}
            </div>
            <Show when={props.isSnoozed}>
              <div class="stat-desc flex items-center gap-1 text-warning">
                <i class="ri-alarm-snooze-line"></i>
                <span>Snoozed: {formatTime(props.snoozeTimeLeft)}</span>
              </div>
            </Show>
            <Show when={!props.isActive && !props.isSnoozed}>
              <div class="stat-desc opacity-50">
                Paused
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default EyeCareIndicator;
