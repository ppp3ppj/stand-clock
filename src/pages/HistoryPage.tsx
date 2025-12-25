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
    <div class="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
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

      {/* Day Sessions */}
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
  );
};

export default HistoryPage;
