import { Component, For, Show } from "solid-js";
import { Session } from "../repositories/SessionTrackingRepository";

interface SessionTimelineProps {
  sessions: Session[];
  date: string;
}

/**
 * Timeline component showing all sessions for a specific day
 * Displays sessions in chronological order with visual indicators
 */
const SessionTimeline: Component<SessionTimelineProps> = (props) => {
  // Format time to HH:MM
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format duration in minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  // Get session type display info
  const getSessionInfo = (session: Session) => {
    const isWork = session.sessionType === 'pomodoro';
    const isShortBreak = session.sessionType === 'shortBreak';
    const isLongBreak = session.sessionType === 'longBreak';

    return {
      icon: isWork ? 'ri-briefcase-line' : 'ri-cup-line',
      label: isWork ? 'Work' : isShortBreak ? 'Short Break' : 'Long Break',
      color: isWork ? 'primary' : isShortBreak ? 'secondary' : 'accent',
      bgColor: isWork ? 'bg-primary/10' : isShortBreak ? 'bg-secondary/10' : 'bg-accent/10',
    };
  };

  // Get status indicator
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: 'ri-checkbox-circle-fill', color: 'text-success' };
      case 'skipped':
        return { icon: 'ri-skip-forward-fill', color: 'text-warning' };
      case 'abandoned':
        return { icon: 'ri-close-circle-fill', color: 'text-error' };
      default:
        return { icon: 'ri-question-line', color: 'text-base-content' };
    }
  };

  // Get break activity icon
  const getActivityIcon = (activity?: string) => {
    if (!activity) return null;
    const activityLower = activity.toLowerCase();

    const icons: Record<string, string> = {
      standing: 'ri-user-line',
      walking: 'ri-walk-line',
      stretching: 'ri-body-scan-line',
      hydration: 'ri-cup-line',
      'eye-rest': 'ri-eye-close-line',
      other: 'ri-more-2-line',
    };

    return icons[activityLower] || 'ri-more-2-line';
  };

  return (
    <div class="timeline-container">
      <Show
        when={props.sessions.length > 0}
        fallback={
          <div class="text-center py-12 opacity-60">
            <i class="ri-calendar-line text-4xl mb-2"></i>
            <p>No sessions recorded for this day</p>
          </div>
        }
      >
        <div class="space-y-2">
          <For each={props.sessions}>
            {(session, index) => {
              const info = getSessionInfo(session);
              const statusIcon = getStatusIcon(session.status);
              const activityIcon = getActivityIcon(session.breakActivity);

              return (
                <div class={`card ${info.bgColor} border-l-4 border-${info.color}`}>
                  <div class="card-body p-4">
                    <div class="flex items-start gap-3">
                      {/* Time */}
                      <div class="flex flex-col items-center min-w-[80px]">
                        <div class="text-sm font-bold">{formatTime(session.startedAt)}</div>
                        <div class="text-xs opacity-60">
                          {formatDuration(session.actualDuration)}
                        </div>
                      </div>

                      {/* Session Type Icon */}
                      <div class={`avatar placeholder`}>
                        <div class={`bg-${info.color} text-${info.color}-content rounded-full w-10 h-10`}>
                          <i class={`${info.icon} text-xl`}></i>
                        </div>
                      </div>

                      {/* Session Details */}
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-semibold">{info.label}</span>
                          <span class={`${statusIcon.color}`}>
                            <i class={`${statusIcon.icon} text-lg`}></i>
                          </span>
                          <Show when={session.status !== 'completed'}>
                            <span class="badge badge-sm">{session.status}</span>
                          </Show>
                        </div>

                        <div class="text-sm opacity-70 mt-1">
                          <Show when={session.sessionType === 'pomodoro'}>
                            Session #{index() + 1}
                          </Show>

                          <Show when={session.breakActivity}>
                            <div class="flex items-center gap-2 mt-1">
                              <Show when={activityIcon}>
                                <i class={activityIcon}></i>
                              </Show>
                              <span class="capitalize">{session.breakActivity}</span>
                            </div>
                          </Show>
                        </div>

                        {/* Duration comparison */}
                        <Show when={session.plannedDuration !== session.actualDuration}>
                          <div class="text-xs opacity-60 mt-1">
                            Planned: {formatDuration(session.plannedDuration)}
                            {session.actualDuration < session.plannedDuration && (
                              <span class="text-warning ml-1">
                                ({Math.round((1 - session.actualDuration / session.plannedDuration) * 100)}% shorter)
                              </span>
                            )}
                          </div>
                        </Show>
                      </div>

                      {/* Completed time */}
                      <div class="text-xs opacity-60">
                        {formatTime(session.completedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default SessionTimeline;
