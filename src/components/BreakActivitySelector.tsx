import { Component, Show } from "solid-js";

interface BreakActivitySelectorProps {
  isOpen: boolean;
  onSelect: (activity: string) => void;
  onClose: () => void;
}

interface Activity {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const activities: Activity[] = [
  {
    id: "standing",
    label: "Standing",
    icon: "ri-user-line",
    description: "Standing up and moving around"
  },
  {
    id: "walking",
    label: "Walking",
    icon: "ri-walk-line",
    description: "Going for a short walk"
  },
  {
    id: "stretching",
    label: "Stretching",
    icon: "ri-body-scan-line",
    description: "Stretching exercises"
  },
  {
    id: "hydration",
    label: "Hydration",
    icon: "ri-cup-line",
    description: "Getting water or refreshments"
  },
  {
    id: "eye-rest",
    label: "Eye Rest",
    icon: "ri-eye-close-line",
    description: "Resting eyes (20-20-20 rule)"
  },
  {
    id: "other",
    label: "Other",
    icon: "ri-more-2-line",
    description: "Other activity"
  },
];

/**
 * Modal component for selecting break activity
 * Shows activity options with icons during break sessions
 */
const BreakActivitySelector: Component<BreakActivitySelectorProps> = (props) => {
  const handleSelect = (activityId: string) => {
    props.onSelect(activityId);
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">What are you doing during this break?</h3>
          <p class="text-sm opacity-70 mb-6">
            Select an activity to track your break habits
          </p>

          <div class="grid grid-cols-2 gap-3">
            {activities.map((activity) => (
              <button
                class="btn btn-outline btn-lg flex-col h-auto py-4 gap-2 normal-case"
                onClick={() => handleSelect(activity.id)}
              >
                <i class={`${activity.icon} text-3xl`}></i>
                <div class="text-center">
                  <div class="font-semibold">{activity.label}</div>
                  <div class="text-xs opacity-60 font-normal">{activity.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div class="modal-action">
            <button class="btn btn-ghost btn-sm" onClick={props.onClose}>
              Skip
            </button>
          </div>
        </div>
        <div class="modal-backdrop" onClick={props.onClose}></div>
      </div>
    </Show>
  );
};

export default BreakActivitySelector;
