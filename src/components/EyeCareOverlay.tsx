import { Component, Show, createSignal, createEffect } from 'solid-js';

interface EyeCareOverlayProps {
  isOpen: boolean;
  countdown: number;          // Seconds remaining
  onDismiss: () => void;      // Manual dismiss
  onSnooze: () => void;       // Snooze for 5 min
}

const EyeCareOverlay: Component<EyeCareOverlayProps> = (props) => {
  let dismissButtonRef: HTMLButtonElement | undefined;

  // Format seconds to MM:SS
  const formatSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (0-100)
  const getProgress = (): number => {
    // Assuming default duration is 20 seconds, adjust based on total
    const total = 20; // This could be passed as a prop if needed
    return ((total - props.countdown) / total) * 100;
  };

  // Auto-focus dismiss button when overlay opens
  createEffect(() => {
    if (props.isOpen && dismissButtonRef) {
      dismissButtonRef.focus();
    }
  });

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        role="dialog"
        aria-labelledby="eye-break-title"
        aria-describedby="eye-break-description"
        aria-modal="true"
      >
        {/* Full-screen backdrop - semi-transparent */}
        <div class="absolute inset-0 bg-base-300/95 backdrop-blur-md"></div>

        {/* Content - centered */}
        <div class="relative flex flex-col items-center justify-center gap-8 px-6 animate-eyeBreakSlideIn">
          {/* Icon */}
          <div class="w-32 h-32 rounded-full bg-info/20 flex items-center justify-center">
            <i class="ri-eye-line text-6xl text-info"></i>
          </div>

          {/* Message */}
          <div class="text-center">
            <h1 id="eye-break-title" class="text-5xl font-bold mb-4">
              Take an Eye Break
            </h1>
            <p class="text-2xl opacity-80 mb-2">
              Look at something 20 feet away
            </p>
            <p class="text-lg opacity-60">
              Give your eyes a rest for 20 seconds
            </p>
            <p id="eye-break-description" class="sr-only">
              Your eyes need a rest. Please look at something 20 feet away for {props.countdown} seconds.
            </p>
          </div>

          {/* Countdown - Large and prominent */}
          <div class="text-9xl font-bold tabular-nums text-info animate-countdownPulse">
            {formatSeconds(props.countdown)}
          </div>

          {/* Progress ring */}
          <div
            class="radial-progress text-info"
            style={{
              "--value": getProgress(),
              "--size": "8rem",
              "--thickness": "0.5rem"
            }}
          >
            <span class="text-2xl font-semibold">{Math.floor(getProgress())}%</span>
          </div>

          {/* Actions */}
          <div class="flex gap-4 mt-8">
            <button
              class="btn btn-outline btn-info btn-lg gap-2"
              onClick={props.onSnooze}
            >
              <i class="ri-alarm-snooze-line text-xl"></i>
              Snooze (5 min)
            </button>
            <button
              ref={dismissButtonRef}
              class="btn btn-ghost btn-lg gap-2"
              onClick={props.onDismiss}
            >
              <i class="ri-close-line text-xl"></i>
              Dismiss
            </button>
          </div>

          {/* Helper text */}
          <p class="text-sm opacity-50 text-center max-w-md mt-4">
            💡 Tip: Focus on a distant object to reduce eye strain and prevent fatigue
          </p>

          {/* Keyboard hints */}
          <div class="flex gap-6 text-xs opacity-40 mt-2">
            <span><kbd class="kbd kbd-sm">ESC</kbd> Dismiss</span>
            <span><kbd class="kbd kbd-sm">S</kbd> Snooze</span>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default EyeCareOverlay;
