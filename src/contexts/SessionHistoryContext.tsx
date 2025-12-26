import { createContext, useContext, createSignal, createEffect, onCleanup, ParentComponent } from "solid-js";
import { IUnitOfWork } from "../repositories/IUnitOfWork";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { SessionHistoryEntry } from "../repositories/SessionHistoryRepository";
import { getMonthRange } from "../utils/dateUtils";

interface SessionHistoryContextValue {
  // Legacy (kept for compatibility during transition)
  entries: () => SessionHistoryEntry[];
  isLoading: () => boolean;

  // Calendar-specific state
  selectedDate: () => Date | null;
  setSelectedDate: (date: Date | null) => void;
  currentMonth: () => Date;
  setCurrentMonth: (date: Date) => void;
  daySessionCounts: () => Map<string, number>;
  selectedDayEntries: () => SessionHistoryEntry[];
  isLoadingDay: () => boolean;
  hasMore: () => boolean;
  isLoadingMore: () => boolean;
  totalCount: () => number;

  // Operations
  addEntry: (entry: Omit<SessionHistoryEntry, 'id'>) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  loadMonthSummary: (date: Date) => Promise<void>;
  loadDayEntries: (date: Date) => Promise<void>;
  loadMoreEntries: () => Promise<void>;
}

const SessionHistoryContext = createContext<SessionHistoryContextValue>();

interface SessionHistoryProviderProps {
  unitOfWork?: IUnitOfWork;
}

export const SessionHistoryProvider: ParentComponent<SessionHistoryProviderProps> = (props) => {
  const unitOfWork = props.unitOfWork ?? createUnitOfWork();

  // Legacy state (kept for compatibility)
  const [entries, setEntries] = createSignal<SessionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);

  // Calendar state
  const [selectedDate, setSelectedDate] = createSignal<Date | null>(null);
  const [currentMonth, setCurrentMonth] = createSignal<Date>(new Date());
  const [daySessionCounts, setDaySessionCounts] = createSignal<Map<string, number>>(new Map());
  const [selectedDayEntries, setSelectedDayEntries] = createSignal<SessionHistoryEntry[]>([]);
  const [isLoadingDay, setIsLoadingDay] = createSignal(false);
  const [isLoadingMore, setIsLoadingMore] = createSignal(false);
  const [totalCount, setTotalCount] = createSignal(0);
  const [currentOffset, setCurrentOffset] = createSignal(0);
  const PAGE_SIZE = 10;

  const loadMonthSummary = async (date: Date) => {
    setIsLoading(true);
    try {
      const { start, end } = getMonthRange(date);
      const summary = await unitOfWork.sessionHistory.getDailySummary(start, end);
      setDaySessionCounts(summary);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to load month summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDayEntries = async (date: Date) => {
    setIsLoadingDay(true);
    setCurrentOffset(0);
    const startTime = Date.now();
    const minLoadingTime = 400; // Minimum 400ms to show skeleton

    try {
      // Load first page and total count in parallel
      const [entries, count] = await Promise.all([
        unitOfWork.sessionHistory.getByDatePaginated(date, PAGE_SIZE, 0),
        unitOfWork.sessionHistory.getCountByDate(date)
      ]);

      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setSelectedDayEntries(entries);
      setTotalCount(count);
      setCurrentOffset(entries.length);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to load day entries:", error);
    } finally {
      setIsLoadingDay(false);
    }
  };

  const loadMoreEntries = async () => {
    const date = selectedDate();
    if (!date || isLoadingMore() || !hasMore()) return;

    setIsLoadingMore(true);
    try {
      const moreEntries = await unitOfWork.sessionHistory.getByDatePaginated(
        date,
        PAGE_SIZE,
        currentOffset()
      );

      setSelectedDayEntries(prev => [...prev, ...moreEntries]);
      setCurrentOffset(prev => prev + moreEntries.length);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to load more entries:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasMore = () => {
    return selectedDayEntries().length < totalCount();
  };

  // Auto-load month summary when currentMonth changes
  createEffect(() => {
    loadMonthSummary(currentMonth());
  });

  // Auto-load day entries when selectedDate changes
  createEffect(() => {
    const date = selectedDate();
    if (date) {
      loadDayEntries(date);
    } else {
      setSelectedDayEntries([]);
    }
  });

  onCleanup(async () => {
    await unitOfWork.dispose();
  });

  const addEntry = async (entry: Omit<SessionHistoryEntry, 'id'>) => {
    try {
      await unitOfWork.sessionHistory.addEntry(entry);

      // Refresh month summary
      await loadMonthSummary(currentMonth());

      // Refresh selected day if affected
      if (selectedDate()) {
        await loadDayEntries(selectedDate()!);
      }
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to add entry:", error);
      throw error;
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await unitOfWork.sessionHistory.delete(id);

      // Refresh month summary
      await loadMonthSummary(currentMonth());

      // Refresh selected day if affected
      if (selectedDate()) {
        await loadDayEntries(selectedDate()!);
      }
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to delete entry:", error);
      throw error;
    }
  };

  const clearAll = async () => {
    try {
      await unitOfWork.sessionHistory.clearAll();
      setEntries([]);
      setDaySessionCounts(new Map());
      setSelectedDayEntries([]);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to clear all:", error);
      throw error;
    }
  };

  const value: SessionHistoryContextValue = {
    // Legacy
    entries,
    isLoading,

    // Calendar-specific
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    daySessionCounts,
    selectedDayEntries,
    isLoadingDay,
    hasMore,
    isLoadingMore,
    totalCount,

    // Operations
    addEntry,
    deleteEntry,
    clearAll,
    loadMonthSummary,
    loadDayEntries,
    loadMoreEntries,
  };

  return (
    <SessionHistoryContext.Provider value={value}>
      {props.children}
    </SessionHistoryContext.Provider>
  );
};

export const useSessionHistory = () => {
  const context = useContext(SessionHistoryContext);
  if (!context) {
    throw new Error("useSessionHistory must be used within a SessionHistoryProvider");
  }
  return context;
};
