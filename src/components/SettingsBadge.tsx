import { Component } from "solid-js";

interface SettingsBadgeProps {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SettingsBadge: Component<SettingsBadgeProps> = (props) => {
  const sizeClass = () => {
    switch (props.size || "md") {
      case "sm": return "badge-sm";
      case "lg": return "badge-lg";
      default: return "";
    }
  };

  return (
    <div class={`badge badge-outline gap-2 ${sizeClass()}`}>
      <i class="ri-timer-line"></i>
      {props.showLabel && <span class="text-xs opacity-70">Settings:</span>}
      <span class="font-mono font-bold">
        {props.workDuration}/{props.shortBreakDuration}/{props.longBreakDuration}
      </span>
    </div>
  );
};

export default SettingsBadge;
