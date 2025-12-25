import { Component, Show, For } from 'solid-js';
import { useSessionHistory } from '../contexts/SessionHistoryContext';
import { SessionHistoryEntry, SessionEventType, SessionType, ActivityType } from '../repositories/SessionHistoryRepository';

const HistoryPage: Component = () => {
  const { entries, isLoading, filter, setFilter, clearAll } = useSessionHistory();

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all session history? This cannot be undone.')) {
      await clearAll();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get icon for session type
  const getSessionIcon = (type: SessionType): string => {
    switch (type) {
      case 'pomodoro':
        return 'ri-focus-line';
      case 'shortBreak':
        return 'ri-cup-line';
      case 'longBreak':
        return 'ri-restaurant-line';
      default:
        return 'ri-timer-line';
    }
  };

  // Get color class for session type
  const getSessionColor = (type: SessionType): string => {
    switch (type) {
      case 'pomodoro':
        return 'badge-primary';
      case 'shortBreak':
        return 'badge-secondary';
      case 'longBreak':
        return 'badge-accent';
      default:
        return 'badge-neutral';
    }
  };

  // Get label for session type
  const getSessionLabel = (type: SessionType): string => {
    switch (type) {
      case 'pomodoro':
        return 'Work';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  // Get event icon
  const getEventIcon = (eventType: SessionEventType): string => {
    switch (eventType) {
      case 'completed':
        return 'ri-checkbox-circle-line';
      case 'skipped':
        return 'ri-skip-forward-line';
      case 'manual_switch':
        return 'ri-arrow-left-right-line';
    }
  };

  // Get event label
  const getEventLabel = (eventType: SessionEventType): string => {
    switch (eventType) {
      case 'completed':
        return 'Completed';
      case 'skipped':
        return 'Skipped';
      case 'manual_switch':
        return 'Switched';
    }
  };

  // Get event color
  const getEventColor = (eventType: SessionEventType): string => {
    switch (eventType) {
      case 'completed':
        return 'text-success';
      case 'skipped':
        return 'text-warning';
      case 'manual_switch':
        return 'text-info';
    }
  };

  // Get activity icon
  const getActivityIcon = (activityType: ActivityType): string => {
    switch (activityType) {
      case 'stretch':
        return 'ri-body-scan-line';
      case 'walk':
        return 'ri-walk-line';
      case 'exercise':
        return 'ri-run-line';
      case 'hydrate':
        return 'ri-cup-line';
      case 'rest':
        return 'ri-zzz-line';
      case 'other':
        return 'ri-more-2-line';
    }
  };

  // Get activity label
  const getActivityLabel = (activityType: ActivityType): string => {
    switch (activityType) {
      case 'stretch':
        return 'Stretch';
      case 'walk':
        return 'Walk';
      case 'exercise':
        return 'Exercise';
      case 'hydrate':
        return 'Hydrate';
      case 'rest':
        return 'Rest';
      case 'other':
        return 'Other';
    }
  };

  return (
    <div class="h-full flex flex-col">
      {/* Header */}
      <div class="flex-none bg-base-200/50 px-8 py-6 border-b border-base-300">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-1">Session History</h1>
            <p class="text-base-content/70">Track your productivity over time</p>
          </div>
          <button
            class="btn btn-outline btn-error btn-sm"
            onClick={handleClearAll}
          >
            <i class="ri-delete-bin-line"></i>
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div class="flex-none bg-base-200/30 px-8 py-4 border-b border-base-300">
        <div class="tabs tabs-boxed bg-base-100">
          <button
            class={`tab ${filter() === 'today' ? 'tab-active' : ''}`}
            onClick={() => setFilter('today')}
          >
            <i class="ri-calendar-line mr-2"></i>
            Today
          </button>
          <button
            class={`tab ${filter() === 'week' ? 'tab-active' : ''}`}
            onClick={() => setFilter('week')}
          >
            <i class="ri-calendar-week-line mr-2"></i>
            Week
          </button>
          <button
            class={`tab ${filter() === 'month' ? 'tab-active' : ''}`}
            onClick={() => setFilter('month')}
          >
            <i class="ri-calendar-month-line mr-2"></i>
            Month
          </button>
          <button
            class={`tab ${filter() === 'all' ? 'tab-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <i class="ri-history-line mr-2"></i>
            All Time
          </button>
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <Show
          when={!isLoading()}
          fallback={
            <div class="flex justify-center items-center h-full">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          <Show
            when={entries().length > 0}
            fallback={
              <div class="flex flex-col items-center justify-center h-full text-center">
                <i class="ri-history-line text-6xl text-base-content/20 mb-4"></i>
                <h3 class="text-2xl font-bold mb-2">No History Yet</h3>
                <p class="text-base-content/60 max-w-md">
                  Start a timer session to begin tracking your productivity.
                  Your completed, skipped, and switched sessions will appear here.
                </p>
              </div>
            }
          >
            {/* Activity Feed */}
            <div class="space-y-3 max-w-4xl mx-auto">
              <For each={entries()}>
                {(entry) => (
                  <div class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                    <div class="card-body p-4">
                      <div class="flex items-center gap-4">
                        {/* Event Icon */}
                        <div class={`text-3xl ${getEventColor(entry.eventType)}`}>
                          <i class={getEventIcon(entry.eventType)}></i>
                        </div>

                        {/* Content */}
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class={`badge ${getSessionColor(entry.sessionType)} badge-sm`}>
                              {getSessionLabel(entry.sessionType)}
                            </span>
                            <Show when={entry.sessionNumber}>
                              <span class="badge badge-ghost badge-sm">
                                Session #{entry.sessionNumber}
                              </span>
                            </Show>
                          </div>
                          <div class="text-sm">
                            <span class="font-semibold">{getEventLabel(entry.eventType)}</span>
                            {' - '}
                            <span class="text-base-content/70">
                              {formatDuration(entry.duration)}
                              <Show when={entry.duration < entry.expectedDuration}>
                                <span class="text-warning ml-1">
                                  (of {formatDuration(entry.expectedDuration)})
                                </span>
                              </Show>
                            </span>
                            {/* Show activity for break sessions */}
                            <Show when={entry.activityType && entry.sessionType !== 'pomodoro'}>
                              <div class="mt-1 flex items-center gap-1 text-xs opacity-80">
                                <i class={`${getActivityIcon(entry.activityType!)} text-sm`}></i>
                                <span>{getActivityLabel(entry.activityType!)}</span>
                              </div>
                            </Show>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div class="text-right text-sm text-base-content/60">
                          <i class="ri-time-line mr-1"></i>
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default HistoryPage;
