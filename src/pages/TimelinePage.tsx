import { Component, For, createMemo } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';
import { useTimer, type TimerMode } from '../contexts/TimerContext';

interface TimelineEntry {
  id: string;
  type: TimerMode;
  sessionNumber?: number;
  status: 'completed' | 'current' | 'upcoming';
  skipped?: boolean;
}

const TimelinePage: Component = () => {
  const { settings } = useTimerSettings();
  const { mode, sessionCount, sessionHistory } = useTimer();

  // Generate timeline entries based on current session and mode
  const timeline = createMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];
    const sessionsBeforeLongBreak = settings().sessionsBeforeLongBreak;
    const currentSessionNumber = sessionCount();
    const currentMode = mode();
    const history = sessionHistory();

    // Helper to check if a session was skipped
    const wasSkipped = (sessionNum: number, type: TimerMode): boolean => {
      const entry = history.find(
        h => h.sessionNumber === sessionNum && h.type === type
      );
      return entry?.skipped ?? false;
    };

    // Add completed sessions
    for (let i = 1; i <= currentSessionNumber; i++) {
      const pomodoroSkipped = wasSkipped(i, 'pomodoro');

      entries.push({
        id: `pomodoro-${i}`,
        type: 'pomodoro',
        sessionNumber: i,
        status: 'completed',
        skipped: pomodoroSkipped,
      });

      // Add break after each completed pomodoro (only if there's a history entry for it)
      const breakType: TimerMode = i % sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
      const breakHistory = history.find(h => h.sessionNumber === i && h.type === breakType);

      // Only show break if it was actually recorded in history
      if (breakHistory) {
        entries.push({
          id: `${breakType}-${i}`,
          type: breakType,
          status: 'completed',
          skipped: breakHistory.skipped,
        });
      }
    }

    // Add current session/break
    if (currentMode === 'pomodoro') {
      entries.push({
        id: `pomodoro-${currentSessionNumber + 1}`,
        type: 'pomodoro',
        sessionNumber: currentSessionNumber + 1,
        status: 'current',
      });
    } else {
      // Currently on a break
      entries.push({
        id: `${currentMode}-current`,
        type: currentMode,
        status: 'current',
      });
    }

    // Add upcoming sessions (next 3 work sessions)
    const upcomingWorkSessions = 3;

    // Start from the next pomodoro session number
    let nextPomodoroNum = currentMode === 'pomodoro' ? currentSessionNumber + 2 : currentSessionNumber + 1;

    for (let i = 0; i < upcomingWorkSessions; i++) {
      const pomodoroNum = nextPomodoroNum + i;

      // Add upcoming break first (for the session before this one)
      if (i === 0 && currentMode !== 'pomodoro') {
        // If we're on a break, the first entry should be the next pomodoro
        entries.push({
          id: `pomodoro-${pomodoroNum}`,
          type: 'pomodoro',
          sessionNumber: pomodoroNum,
          status: 'upcoming',
        });
      } else {
        // Add the break that comes after the previous session
        const previousSessionNum = pomodoroNum - 1;
        if (previousSessionNum > currentSessionNumber || currentMode !== 'pomodoro') {
          const breakType: TimerMode = previousSessionNum % sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
          entries.push({
            id: `${breakType}-upcoming-${previousSessionNum}`,
            type: breakType,
            status: 'upcoming',
          });
        }

        // Add the pomodoro session
        entries.push({
          id: `pomodoro-${pomodoroNum}`,
          type: 'pomodoro',
          sessionNumber: pomodoroNum,
          status: 'upcoming',
        });
      }
    }

    return entries;
  });

  const getTypeLabel = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'pomodoro':
        return 'Work Session';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const getTypeDuration = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'pomodoro':
        return `${settings().workDuration} min`;
      case 'shortBreak':
        return `${settings().shortBreakDuration} min`;
      case 'longBreak':
        return `${settings().longBreakDuration} min`;
    }
  };

  const getTypeIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'pomodoro':
        return 'ri-timer-line';
      case 'shortBreak':
        return 'ri-cup-line';
      case 'longBreak':
        return 'ri-restaurant-line';
    }
  };

  const getTypeColor = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'pomodoro':
        return 'primary';
      case 'shortBreak':
        return 'secondary';
      case 'longBreak':
        return 'accent';
    }
  };

  const getStatusStyles = (status: TimelineEntry['status'], skipped?: boolean) => {
    if (skipped) {
      return {
        opacity: 'opacity-40',
        badge: 'badge-error',
        icon: 'ri-skip-forward-line',
        label: 'skipped',
      };
    }

    switch (status) {
      case 'completed':
        return {
          opacity: 'opacity-50',
          badge: 'badge-success',
          icon: 'ri-check-line',
          label: 'completed',
        };
      case 'current':
        return {
          opacity: 'opacity-100',
          badge: 'badge-warning',
          icon: 'ri-play-circle-line',
          label: 'current',
        };
      case 'upcoming':
        return {
          opacity: 'opacity-30',
          badge: 'badge-ghost',
          icon: 'ri-time-line',
          label: 'upcoming',
        };
    }
  };

  return (
    <div class="h-full flex flex-col">
      {/* Fixed Header */}
      <div class="flex-none px-4 py-3 bg-base-200/50 border-b border-base-300">
        <h1 class="text-xl font-bold">Timeline</h1>
        <p class="text-xs opacity-70 mt-1">Track your Pomodoro session progress</p>
      </div>

      {/* Scrollable Timeline */}
      <div class="flex-1 overflow-y-auto px-4 py-6">
        <div class="w-full max-w-2xl mx-auto">
          <For each={timeline()}>
            {(entry, index) => {
              const statusStyles = getStatusStyles(entry.status, entry.skipped);
              const color = getTypeColor(entry.type);
              const isLast = index() === timeline().length - 1;

              return (
                <div class="flex gap-4 relative">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div
                      class={`absolute left-6 top-12 bottom-0 w-1 ${
                        entry.skipped
                          ? 'bg-error/30'
                          : entry.status === 'completed'
                          ? `bg-${color}`
                          : 'bg-base-300'
                      } ${statusStyles.opacity}`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div class="flex-none">
                    <div
                      class={`w-12 h-12 rounded-full ${
                        entry.skipped ? 'bg-error' : `bg-${color}`
                      } flex items-center justify-center ${statusStyles.opacity} relative z-10 ${
                        entry.status === 'current' ? 'ring-4 ring-warning ring-offset-2 ring-offset-base-100' : ''
                      }`}
                    >
                      <i class={`${
                        entry.skipped ? 'ri-skip-forward-line' : getTypeIcon(entry.type)
                      } text-xl ${entry.skipped ? 'text-error-content' : `text-${color}-content`}`}></i>
                    </div>
                  </div>

                  {/* Content */}
                  <div class={`flex-1 pb-8 ${statusStyles.opacity}`}>
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-semibold">
                            {getTypeLabel(entry.type)}
                            {entry.sessionNumber && ` #${entry.sessionNumber}`}
                          </h3>
                          <span class={`badge ${statusStyles.badge} badge-sm gap-1`}>
                            <i class={`${statusStyles.icon} text-xs`}></i>
                            {statusStyles.label}
                          </span>
                        </div>
                        <div class="text-sm opacity-70">
                          Duration: {getTypeDuration(entry.type)}
                          {entry.skipped && <span class="text-error ml-2">(Not completed)</span>}
                        </div>
                        {entry.status === 'current' && (
                          <div class="mt-2">
                            <div class="badge badge-warning gap-2">
                              <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-content opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-warning-content"></span>
                              </span>
                              You are here
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
