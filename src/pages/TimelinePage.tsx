import { Component, For, createMemo } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';
import { useTimer, type TimerMode } from '../contexts/TimerContext';

interface TimelineEntry {
  id: string;
  type: TimerMode;
  sessionNumber?: number;
  status: 'completed' | 'current' | 'upcoming';
}

const TimelinePage: Component = () => {
  const { settings } = useTimerSettings();
  const { mode, sessionCount } = useTimer();

  // Generate timeline entries based on current session and mode
  const timeline = createMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];
    const sessionsBeforeLongBreak = settings().sessionsBeforeLongBreak;
    const currentSessionNumber = sessionCount();
    const currentMode = mode();

    // Add completed sessions
    for (let i = 1; i <= currentSessionNumber; i++) {
      entries.push({
        id: `pomodoro-${i}`,
        type: 'pomodoro',
        sessionNumber: i,
        status: 'completed',
      });

      // Add break after each completed pomodoro
      if (i % sessionsBeforeLongBreak === 0) {
        entries.push({
          id: `long-break-${i}`,
          type: 'longBreak',
          status: 'completed',
        });
      } else {
        entries.push({
          id: `short-break-${i}`,
          type: 'shortBreak',
          status: 'completed',
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

    // Add upcoming sessions (next 3)
    const upcomingSessions = 3;
    const nextPomodoroSession = currentMode === 'pomodoro' ? currentSessionNumber + 2 : currentSessionNumber + 1;

    for (let i = 0; i < upcomingSessions; i++) {
      const sessionNum = nextPomodoroSession + i;

      // If currently on a break, add the upcoming pomodoro first
      if (currentMode !== 'pomodoro' && i === 0) {
        entries.push({
          id: `pomodoro-${sessionNum}`,
          type: 'pomodoro',
          sessionNumber: sessionNum,
          status: 'upcoming',
        });
      }

      // Add upcoming break
      const completedAfterThis = currentMode === 'pomodoro' ? sessionNum : sessionNum;
      if (completedAfterThis % sessionsBeforeLongBreak === 0) {
        entries.push({
          id: `long-break-upcoming-${sessionNum}`,
          type: 'longBreak',
          status: 'upcoming',
        });
      } else {
        entries.push({
          id: `short-break-upcoming-${sessionNum}`,
          type: 'shortBreak',
          status: 'upcoming',
        });
      }

      // Add upcoming pomodoro (except for first iteration when on break)
      if (!(currentMode !== 'pomodoro' && i === 0)) {
        entries.push({
          id: `pomodoro-${sessionNum + 1}`,
          type: 'pomodoro',
          sessionNumber: sessionNum + 1,
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

  const getStatusStyles = (status: TimelineEntry['status']) => {
    switch (status) {
      case 'completed':
        return {
          opacity: 'opacity-50',
          badge: 'badge-success',
          icon: 'ri-check-line',
        };
      case 'current':
        return {
          opacity: 'opacity-100',
          badge: 'badge-warning',
          icon: 'ri-play-circle-line',
        };
      case 'upcoming':
        return {
          opacity: 'opacity-30',
          badge: 'badge-ghost',
          icon: 'ri-time-line',
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
              const statusStyles = getStatusStyles(entry.status);
              const color = getTypeColor(entry.type);
              const isLast = index() === timeline().length - 1;

              return (
                <div class="flex gap-4 relative">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div
                      class={`absolute left-6 top-12 bottom-0 w-1 ${
                        entry.status === 'completed' ? `bg-${color}` : 'bg-base-300'
                      } ${statusStyles.opacity}`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div class="flex-none">
                    <div
                      class={`w-12 h-12 rounded-full bg-${color} flex items-center justify-center ${statusStyles.opacity} relative z-10 ${
                        entry.status === 'current' ? 'ring-4 ring-warning ring-offset-2 ring-offset-base-100' : ''
                      }`}
                    >
                      <i class={`${getTypeIcon(entry.type)} text-xl text-${color}-content`}></i>
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
                            {entry.status}
                          </span>
                        </div>
                        <div class="text-sm opacity-70">
                          Duration: {getTypeDuration(entry.type)}
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
