import { createContext, useContext, ParentComponent, createSignal, Accessor } from 'solid-js';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerState {
  mode: Accessor<TimerMode>;
  timeLeft: Accessor<number>;
  isRunning: Accessor<boolean>;
  sessionCount: Accessor<number>;
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setIsRunning: (running: boolean) => void;
  setSessionCount: (count: number | ((prev: number) => number)) => void;
}

const TimerContext = createContext<TimerState>();

export const TimerProvider: ParentComponent = (props) => {
  const [mode, setMode] = createSignal<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = createSignal(0);
  const [isRunning, setIsRunning] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);

  const state: TimerState = {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    setMode,
    setTimeLeft,
    setIsRunning,
    setSessionCount,
  };

  return (
    <TimerContext.Provider value={state}>
      {props.children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
