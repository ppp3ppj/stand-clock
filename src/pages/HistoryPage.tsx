import { Component, onMount } from 'solid-js';
import { useSessionHistory } from '../contexts/SessionHistoryContext';
import DaySessionList from '../components/DaySessionList';
import 'cally';

const HistoryPage: Component = () => {
  let calendarRef: any;

  const {
    selectedDate,
    setSelectedDate,
    setCurrentMonth,
    selectedDayEntries,
    isLoadingDay
  } = useSessionHistory();

  // Auto-select today on mount
  onMount(() => {
    setSelectedDate(new Date());
  });

  const handleCalendarChange = (e: any) => {
    const selected = new Date(e.target.value);
    setSelectedDate(selected);
    setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    // Close the popover
    if (calendarRef) {
      calendarRef.closest('[popover]')?.hidePopover();
    }
  };

  const formatDateForCally = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePrevDay = () => {
    if (selectedDate()) {
      const prevDay = new Date(selectedDate()!);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
      setCurrentMonth(new Date(prevDay.getFullYear(), prevDay.getMonth(), 1));
    }
  };

  const handleNextDay = () => {
    if (selectedDate()) {
      const nextDay = new Date(selectedDate()!);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
      setCurrentMonth(new Date(nextDay.getFullYear(), nextDay.getMonth(), 1));
    }
  };

  return (
    <div class="h-full flex flex-col">
      {/* Header - Sticky */}
      <div class="flex-none bg-base-200 px-6 sm:px-8 py-6 shadow-sm sticky top-0 z-10">
        <div class="max-w-3xl mx-auto space-y-4">
          {/* Title */}
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold mb-2">Session History</h1>
            <p class="text-base-content/60">Track your productivity over time</p>
          </div>

          {/* Date Navigation - Always Accessible */}
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                class="btn btn-circle btn-sm"
                aria-label="Previous day"
              >
                <i class="ri-arrow-left-s-line text-xl"></i>
              </button>
              <button
                popovertarget="history-calendar-popover"
                class="btn btn-ghost btn-sm gap-2 text-lg font-bold"
                id="history-calendar-trigger"
                style="anchor-name:--history-calendar-trigger"
              >
                <i class="ri-calendar-event-line"></i>
                <span>
                  {selectedDate() ? new Date(selectedDate()!).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : ''}
                </span>
              </button>
              <button
                onClick={handleNextDay}
                class="btn btn-circle btn-sm"
                aria-label="Next day"
              >
                <i class="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>

            {/* Filter Placeholder */}
            <div class="hidden sm:flex items-center gap-2">
              <div class="badge badge-ghost gap-2 opacity-50 cursor-not-allowed">
                <i class="ri-filter-3-line"></i>
                <span class="text-xs">Filters coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
        <div class="max-w-3xl mx-auto">
          <DaySessionList
            date={selectedDate()}
            entries={selectedDayEntries()}
            isLoading={isLoadingDay()}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            }}
            hideNavigation={true}
          />
        </div>
      </div>

      {/* Cally Date Picker Popover */}
      <div popover id="history-calendar-popover" class="dropdown bg-base-100 rounded-box shadow-lg p-4" style="position-anchor:--history-calendar-trigger">
        <calendar-date
          ref={calendarRef}
          value={selectedDate() ? formatDateForCally(selectedDate()!) : formatDateForCally(new Date())}
          class="cally"
          onchange={handleCalendarChange}
        >
          <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
          <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
    </div>
  );
};

export default HistoryPage;
