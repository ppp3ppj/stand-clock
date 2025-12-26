import { Component, Show, For } from 'solid-js';
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
  let calendarRef: any;

  const handleCalendarChange = (e: any) => {
    const selectedDate = new Date(e.target.value);
    props.onDateSelect(selectedDate);
    // Close the popover
    if (calendarRef) {
      calendarRef.closest('[popover]')?.hidePopover();
    }
  };

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
      {/* Sticky Date Navigation Header */}
      <Show when={props.date}>
        <div class="sticky top-0 z-10 bg-base-200 py-4 mb-6 -mx-6 sm:-mx-8 px-6 sm:px-8 shadow-sm">
          <div class="max-w-3xl mx-auto flex items-center justify-center gap-3">
            {/* Previous Day Button */}
            <button
              onClick={handlePrevDay}
              class="btn btn-circle btn-sm"
              aria-label="Previous day"
            >
              <i class="ri-arrow-left-s-line text-xl"></i>
            </button>

            {/* Current Date - Clickable */}
            <button
              popovertarget="cally-popover"
              class="btn btn-ghost gap-2 text-lg font-bold"
              id="cally-trigger"
              style="anchor-name:--cally-trigger"
            >
              <i class="ri-calendar-event-line"></i>
              <span>{formatDateLong(props.date!)}</span>
            </button>

            {/* Next Day Button */}
            <button
              onClick={handleNextDay}
              class="btn btn-circle btn-sm"
              aria-label="Next day"
            >
              <i class="ri-arrow-right-s-line text-xl"></i>
            </button>
          </div>
        </div>
      </Show>

      <div class="space-y-3">

        {/* Loading State */}
        <Show
          when={!props.isLoading}
          fallback={
            <div class="space-y-3">
              <For each={[1, 2, 3, 4, 5, 6]}>
                {() => (
                  <div class="card bg-base-100 shadow-sm">
                    <div class="card-body p-4">
                      <div class="flex items-center gap-4">
                        {/* Icon skeleton */}
                        <div class="skeleton h-10 w-10 shrink-0 rounded-full"></div>

                        {/* Content skeleton */}
                        <div class="flex-1 space-y-2">
                          <div class="flex gap-2">
                            <div class="skeleton h-6 w-24 rounded-full"></div>
                            <div class="skeleton h-6 w-12 rounded-full"></div>
                          </div>
                          <div class="skeleton h-4 w-3/4"></div>
                        </div>

                        {/* Timestamp skeleton */}
                        <div class="skeleton h-4 w-20 shrink-0"></div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          {/* Empty State */}
          <Show
            when={props.entries.length > 0}
            fallback={
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body items-center text-center py-16">
                  <i class="ri-inbox-line text-6xl text-base-content/20 mb-4"></i>
                  <h3 class="text-xl font-bold mb-2">No Sessions</h3>
                  <p class="text-base-content/60">
                    No sessions recorded for this day.
                  </p>
                </div>
              </div>
            }
          >
            {/* Session List */}
            <div class="space-y-3">
              <For each={props.entries}>
                {(entry) => (
                  <div class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                    <div class="card-body p-4">
                      <div class="flex items-center gap-4">
                        {/* Event Icon */}
                        <div class={`avatar placeholder shrink-0`}>
                          <div class={`w-10 h-10 rounded-full ${getEventColor(entry.eventType)} bg-opacity-10 flex items-center justify-center`}>
                            <i class={`${getEventIcon(entry.eventType)} text-xl ${getEventColor(entry.eventType)}`}></i>
                          </div>
                        </div>

                        {/* Content */}
                        <div class="flex-1 min-w-0">
                          <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class={`badge ${getSessionColor(entry.sessionType)} gap-1`}>
                              <i class={`${getSessionIcon(entry.sessionType)} text-xs`}></i>
                              {getSessionLabel(entry.sessionType)}
                            </span>
                            <Show when={entry.sessionNumber}>
                              <span class="badge badge-outline badge-sm">
                                #{entry.sessionNumber}
                              </span>
                            </Show>
                          </div>
                          <div class="flex flex-wrap items-center gap-x-2 text-sm">
                            <span class="font-semibold">{getEventLabel(entry.eventType)}</span>
                            <span class="text-base-content/60">•</span>
                            <span class="text-base-content/70">
                              {formatDuration(entry.duration)}
                              <Show when={entry.duration < entry.expectedDuration}>
                                <span class="text-warning ml-1">
                                  / {formatDuration(entry.expectedDuration)}
                                </span>
                              </Show>
                            </span>
                          </div>
                          {/* Show activity for break sessions */}
                          <Show when={entry.activityType && entry.sessionType !== 'pomodoro'}>
                            <div class="flex items-center gap-1.5 text-xs opacity-70 mt-1">
                              <i class={`${getActivityIcon(entry.activityType!)}`}></i>
                              <span>{getActivityLabel(entry.activityType!)}</span>
                            </div>
                          </Show>
                        </div>

                        {/* Timestamp */}
                        <div class="text-sm text-base-content/60 shrink-0 flex items-center gap-1">
                          <i class="ri-time-line"></i>
                          <span>{formatTimestamp(entry.timestamp)}</span>
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

      {/* Cally Date Picker Popover */}
      <div popover id="cally-popover" class="dropdown bg-base-100 rounded-box shadow-lg p-4" style="position-anchor:--cally-trigger">
        <calendar-date
          ref={calendarRef}
          value={props.date ? formatDateForCally(props.date) : formatDateForCally(new Date())}
          class="cally"
          onchange={handleCalendarChange}
        >
          <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
          <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </>
  );
};

export default DaySessionList;
