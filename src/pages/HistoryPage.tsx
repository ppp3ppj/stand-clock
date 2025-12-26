import { Component, onMount } from 'solid-js';
import { useSessionHistory } from '../contexts/SessionHistoryContext';
import DaySessionList from '../components/DaySessionList';

const HistoryPage: Component = () => {
  const {
    selectedDate,
    setSelectedDate,
    setCurrentMonth,
    selectedDayEntries,
    isLoadingDay,
    clearAll
  } = useSessionHistory();

  // Auto-select today on mount
  onMount(() => {
    setSelectedDate(new Date());
  });

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all session history? This cannot be undone.')) {
      await clearAll();
    }
  };

  return (
    <div class="min-h-full">
      {/* Header - Static */}
      <div class="bg-base-200 px-6 sm:px-8 py-6 shadow-sm">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold mb-2">Session History</h1>
            <p class="text-base-content/60">Track your productivity over time</p>
          </div>
          <button
            class="btn btn-outline btn-error btn-sm"
            onClick={handleClearAll}
          >
            <i class="ri-delete-bin-line"></i>
            <span class="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div class="px-6 sm:px-8 py-6">
        <div class="max-w-3xl mx-auto">
          <DaySessionList
            date={selectedDate()}
            entries={selectedDayEntries()}
            isLoading={isLoadingDay()}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
