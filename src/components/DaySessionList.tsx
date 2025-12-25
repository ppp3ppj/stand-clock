import { Component, Show, For, createSignal, onMount } from 'solid-js';
import { SessionHistoryEntry, SessionEventType, SessionType, ActivityType } from '../repositories/SessionHistoryRepository';
import { formatDateLong } from '../utils/dateUtils';
import 'cally';

interface DaySessionListProps {
  date: Date | null;
  entries: SessionHistoryEntry[];
  isLoading: boolean;
  onDateSelect: (date: Date) => void;
}

const DaySessionList: Component<DaySessionListProps> = (props) => {
  const [showDatePicker, setShowDatePicker] = createSignal(false);
  let calendarRef: any;

  onMount(() => {
    // Listen for date selection from cally calendar
    if (calendarRef) {
      calendarRef.addEventListener('change', (e: any) => {
        const selectedDate = new Date(e.target.value);
        props.onDateSelect(selectedDate);
        setShowDatePicker(false);
      });
    }
  });

  const handlePrevDay = () => {
    if (props.date) {
      const prevDay = new Date(props.date);
      prevDay.setDate(prevDay.getDate() - 1);
      props.onDateSelect(prevDay);
    }
  };

  const handleNextDay = () => {
    if (props.date) {
      const nextDay = new Date(props.date);
      nextDay.setDate(nextDay.getDate() + 1);
      props.onDateSelect(nextDay);
    }
  };

  const formatDateForCally = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format timestamp for display (time only since we know the date)
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body p-4">
          {/* Date Navigation Header */}
          <Show when={props.date}>
            <div class="flex items-center justify-between mb-4">
              {/* Previous Day Button */}
              <button
                onClick={handlePrevDay}
                class="btn btn-ghost btn-sm"
                aria-label="Previous day"
              >
                <i class="ri-arrow-left-s-line text-lg"></i>
              </button>

              {/* Current Date - Clickable */}
              <button
                onClick={() => setShowDatePicker(true)}
                class="btn btn-ghost btn-sm flex items-center gap-2 hover:btn-primary"
              >
                <i class="ri-calendar-event-line"></i>
                <span class="font-semibold">{formatDateLong(props.date!)}</span>
              </button>

              {/* Next Day Button */}
              <button
                onClick={handleNextDay}
                class="btn btn-ghost btn-sm"
                aria-label="Next day"
              >
                <i class="ri-arrow-right-s-line text-lg"></i>
              </button>
            </div>
          </Show>

        {/* Loading State */}
        <Show
          when={!props.isLoading}
          fallback={
            <div class="flex justify-center items-center py-12">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {/* Empty State */}
          <Show
            when={props.entries.length > 0}
            fallback={
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <i class="ri-inbox-line text-5xl text-base-content/20 mb-3"></i>
                <h3 class="text-lg font-semibold mb-1">No Sessions</h3>
                <p class="text-base-content/60 text-sm">
                  No sessions recorded for this day.
                </p>
              </div>
            }
          >
            {/* Session List */}
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <For each={props.entries}>
                {(entry) => (
                  <div class="bg-base-100 rounded-lg p-3 hover:bg-base-100/70 transition-colors">
                    <div class="flex items-center gap-3">
                      {/* Event Icon */}
                      <div class={`text-2xl ${getEventColor(entry.eventType)}`}>
                        <i class={getEventIcon(entry.eventType)}></i>
                      </div>

                      {/* Content */}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class={`badge ${getSessionColor(entry.sessionType)} badge-sm`}>
                            {getSessionLabel(entry.sessionType)}
                          </span>
                          <Show when={entry.sessionNumber}>
                            <span class="badge badge-ghost badge-sm">
                              #{entry.sessionNumber}
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
                      <div class="text-right text-xs text-base-content/60 flex-shrink-0">
                        <i class="ri-time-line mr-1"></i>
                        {formatTimestamp(entry.timestamp)}
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

      {/* Cally Date Picker Modal */}
      <Show when={showDatePicker()}>
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Select a Date</h3>

            <calendar-date
              ref={calendarRef}
              value={props.date ? formatDateForCally(props.date) : formatDateForCally(new Date())}
              class="cally bg-base-100 border border-base-300 shadow-lg rounded-box p-4"
            >
              <i class="ri-arrow-left-s-line text-lg" slot="previous" aria-label="Previous month"></i>
              <i class="ri-arrow-right-s-line text-lg" slot="next" aria-label="Next month"></i>
              <calendar-month></calendar-month>
            </calendar-date>

            <div class="modal-action">
              <button class="btn" onClick={() => setShowDatePicker(false)}>
                Close
              </button>
            </div>
          </div>
          <div class="modal-backdrop" onClick={() => setShowDatePicker(false)}></div>
        </div>
      </Show>
    </>
  );
};

export default DaySessionList;
