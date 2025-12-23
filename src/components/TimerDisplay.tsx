/**
 * Timer Display Component
 * Displays the countdown timer with formatted time
 */

import { Component } from "solid-js";
import { formatTimeMMSS } from "../utils/timeUtils";

interface TimerDisplayProps {
  timeLeft: number;
}

const TimerDisplay: Component<TimerDisplayProps> = (props) => {
  return (
    <div class="text-center py-8">
      <div class="text-9xl font-bold tabular-nums tracking-tight">
        {formatTimeMMSS(props.timeLeft)}
      </div>
    </div>
  );
};

export default TimerDisplay;
