import { Component, Show } from 'solid-js';
import { ActivityType } from '../repositories/SessionHistoryRepository';

interface ActivityOption {
  type: ActivityType;
  label: string;
  icon: string;
  description: string;
}

const activityOptions: ActivityOption[] = [
  {
    type: 'stretch',
    label: 'Stretch',
    icon: 'ri-body-scan-line',
    description: 'Stretching exercises'
  },
  {
    type: 'walk',
    label: 'Walk',
    icon: 'ri-walk-line',
    description: 'Short walk around'
  },
  {
    type: 'exercise',
    label: 'Exercise',
    icon: 'ri-run-line',
    description: 'Physical exercise'
  },
  {
    type: 'hydrate',
    label: 'Hydrate',
    icon: 'ri-cup-line',
    description: 'Drink water/beverage'
  },
  {
    type: 'rest',
    label: 'Rest',
    icon: 'ri-zzz-line',
    description: 'Just resting'
  },
  {
    type: 'other',
    label: 'Other',
    icon: 'ri-more-2-line',
    description: 'Other activity'
  }
];

interface ActivitySelectionDialogProps {
  isOpen: boolean;
  breakType: 'shortBreak' | 'longBreak';
  onSelect: (activity: ActivityType) => void;
  onSkip: () => void;
}

const ActivitySelectionDialog: Component<ActivitySelectionDialogProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Dialog */}
        <div class="relative bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
          <div class="text-center mb-6">
            <i class="ri-question-line text-5xl text-primary mb-3"></i>
            <h2 class="text-2xl font-bold mb-2">
              {props.breakType === 'shortBreak' ? 'Short Break' : 'Long Break'} Started!
            </h2>
            <p class="text-base-content/70">
              What activity will you do during this break?
            </p>
          </div>

          {/* Activity Grid */}
          <div class="grid grid-cols-2 gap-3 mb-4">
            {activityOptions.map((option) => (
              <button
                class="btn btn-lg h-auto flex-col gap-2 py-4 hover:scale-105 transition-transform"
                onClick={() => props.onSelect(option.type)}
              >
                <i class={`${option.icon} text-3xl`}></i>
                <div class="text-center">
                  <div class="font-bold">{option.label}</div>
                  <div class="text-xs opacity-70 normal-case">{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Skip Button */}
          <button
            class="btn btn-ghost btn-block btn-sm"
            onClick={props.onSkip}
          >
            Skip for now
          </button>
        </div>
      </div>
    </Show>
  );
};

export default ActivitySelectionDialog;
