import { createContext, useContext, createSignal, onMount, onCleanup, ParentComponent } from "solid-js";
import { IUnitOfWork } from "../repositories/IUnitOfWork";
import { createUnitOfWork } from "../repositories/SqliteUnitOfWork";
import { SessionHistoryEntry } from "../repositories/SessionHistoryRepository";

type TimeFilter = 'today' | 'week' | 'month' | 'all';

interface SessionHistoryContextValue {
  entries: () => SessionHistoryEntry[];
  isLoading: () => boolean;
  filter: () => TimeFilter;
  setFilter: (filter: TimeFilter) => void;
  addEntry: (entry: Omit<SessionHistoryEntry, 'id'>) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionHistoryContext = createContext<SessionHistoryContextValue>();

interface SessionHistoryProviderProps {
  unitOfWork?: IUnitOfWork;
}

export const SessionHistoryProvider: ParentComponent<SessionHistoryProviderProps> = (props) => {
  const unitOfWork = props.unitOfWork ?? createUnitOfWork();

  const [entries, setEntries] = createSignal<SessionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [filter, setFilterSignal] = createSignal<TimeFilter>('today');

  const loadEntries = async (currentFilter: TimeFilter) => {
    setIsLoading(true);
    try {
      let loaded: SessionHistoryEntry[];
      switch (currentFilter) {
        case 'today':
          loaded = await unitOfWork.sessionHistory.getToday();
          break;
        case 'week':
          loaded = await unitOfWork.sessionHistory.getThisWeek();
          break;
        case 'month':
          loaded = await unitOfWork.sessionHistory.getThisMonth();
          break;
        case 'all':
          loaded = await unitOfWork.sessionHistory.getAll();
          break;
      }
      setEntries(loaded);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(async () => {
    await loadEntries(filter());
  });

  onCleanup(async () => {
    await unitOfWork.dispose();
  });

  const addEntry = async (entry: Omit<SessionHistoryEntry, 'id'>) => {
    try {
      await unitOfWork.sessionHistory.addEntry(entry);
      await loadEntries(filter());
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to add entry:", error);
      throw error;
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await unitOfWork.sessionHistory.delete(id);
      await loadEntries(filter());
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to delete entry:", error);
      throw error;
    }
  };

  const clearAll = async () => {
    try {
      await unitOfWork.sessionHistory.clearAll();
      setEntries([]);
    } catch (error) {
      console.error("[SessionHistoryContext] Failed to clear all:", error);
      throw error;
    }
  };

  const refresh = async () => {
    await loadEntries(filter());
  };

  // Auto-refresh when filter changes
  const setFilter = async (newFilter: TimeFilter) => {
    setFilterSignal(newFilter);
    await loadEntries(newFilter);
  };

  const value: SessionHistoryContextValue = {
    entries,
    isLoading,
    filter,
    setFilter,
    addEntry,
    deleteEntry,
    clearAll,
    refresh,
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
