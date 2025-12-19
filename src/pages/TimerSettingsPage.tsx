import { Component, createSignal, Show } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';

const TimerSettingsPage: Component = () => {
  const { settings, updateSettings, resetToDefaults, isLoading } = useTimerSettings();

  // Local state for UI (synced with context)
  const [workDuration, setWorkDuration] = createSignal(settings().workDuration);
  const [shortBreakDuration, setShortBreakDuration] = createSignal(settings().shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = createSignal(settings().longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = createSignal(settings().sessionsBeforeLongBreak);
  const [soundEnabled, setSoundEnabled] = createSignal(settings().soundEnabled);
  const [isSaving, setIsSaving] = createSignal(false);

  // Update local state when settings load
  const syncLocalState = () => {
    setWorkDuration(settings().workDuration);
    setShortBreakDuration(settings().shortBreakDuration);
    setLongBreakDuration(settings().longBreakDuration);
    setSessionsBeforeLongBreak(settings().sessionsBeforeLongBreak);
    setSoundEnabled(settings().soundEnabled);
  };

  // Watch for settings changes
  const hasChanges = () => {
    return (
      workDuration() !== settings().workDuration ||
      shortBreakDuration() !== settings().shortBreakDuration ||
      longBreakDuration() !== settings().longBreakDuration ||
      sessionsBeforeLongBreak() !== settings().sessionsBeforeLongBreak ||
      soundEnabled() !== settings().soundEnabled
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings({
      workDuration: workDuration(),
      shortBreakDuration: shortBreakDuration(),
      longBreakDuration: longBreakDuration(),
      sessionsBeforeLongBreak: sessionsBeforeLongBreak(),
      soundEnabled: soundEnabled(),
    });
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to default settings?')) {
      await resetToDefaults();
      syncLocalState();
    }
  };

  const workPresets = [15, 25, 45, 50, 55];
  const shortBreakPresets = [3, 5, 7, 10];
  const longBreakPresets = [10, 15, 20, 30];

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main class="container mx-auto p-4 md:p-8 max-w-4xl">
      <Show when={!isLoading()} fallback={
        <div class="flex justify-center items-center h-96">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      }>
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-2">Timer Settings</h1>
          <p class="text-base-content/70">Customize your work and break durations</p>
        </div>

        <div class="space-y-6">
          {/* Work Session Duration */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="card-title text-2xl mb-1">Work Session Duration</h2>
                  <p class="text-sm text-base-content/70">Time spent working before a break</p>
                </div>
                <div class="badge badge-primary badge-lg">{workDuration()} min</div>
              </div>

              {/* Quick Presets */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Quick Presets</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  {workPresets.map(preset => (
                    <button
                      class={`btn ${workDuration() === preset ? 'btn-primary' : 'btn-outline btn-primary'}`}
                      onClick={() => setWorkDuration(preset)}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range Slider */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Custom Duration</span>
                  <span class="label-text-alt">{formatTime(workDuration())}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={workDuration()}
                  class="range range-primary"
                  step="5"
                  onInput={(e) => setWorkDuration(parseInt(e.currentTarget.value))}
                />
                <div class="flex justify-between text-xs px-2 mt-1 text-base-content/60">
                  <span>5 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Recommendation Badge */}
              <div class="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">Recommended: 25-55 min based on research</span>
              </div>
            </div>
          </div>

          {/* Short Break Duration */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="card-title text-2xl mb-1">Short Break Duration</h2>
                  <p class="text-sm text-base-content/70">Quick standing/stretching break</p>
                </div>
                <div class="badge badge-secondary badge-lg">{shortBreakDuration()} min</div>
              </div>

              {/* Quick Presets */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Quick Presets</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  {shortBreakPresets.map(preset => (
                    <button
                      class={`btn ${shortBreakDuration() === preset ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
                      onClick={() => setShortBreakDuration(preset)}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range Slider */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Custom Duration</span>
                  <span class="label-text-alt">{formatTime(shortBreakDuration())}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={shortBreakDuration()}
                  class="range range-secondary"
                  step="1"
                  onInput={(e) => setShortBreakDuration(parseInt(e.currentTarget.value))}
                />
                <div class="flex justify-between text-xs px-2 mt-1 text-base-content/60">
                  <span>1 min</span>
                  <span>8 min</span>
                  <span>15 min</span>
                </div>
              </div>

              {/* Purpose Info */}
              <div class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">Purpose: Quick posture reset, eye rest, light stretching</span>
              </div>
            </div>
          </div>

          {/* Long Break Duration */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="card-title text-2xl mb-1">Long Break Duration</h2>
                  <p class="text-sm text-base-content/70">Extended break for deeper exercises</p>
                </div>
                <div class="badge badge-accent badge-lg">{longBreakDuration()} min</div>
              </div>

              {/* Quick Presets */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Quick Presets</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  {longBreakPresets.map(preset => (
                    <button
                      class={`btn ${longBreakDuration() === preset ? 'btn-accent' : 'btn-outline btn-accent'}`}
                      onClick={() => setLongBreakDuration(preset)}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range Slider */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Custom Duration</span>
                  <span class="label-text-alt">{formatTime(longBreakDuration())}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={longBreakDuration()}
                  class="range range-accent"
                  step="5"
                  onInput={(e) => setLongBreakDuration(parseInt(e.currentTarget.value))}
                />
                <div class="flex justify-between text-xs px-2 mt-1 text-base-content/60">
                  <span>10 min</span>
                  <span>20 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Purpose Info */}
              <div class="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span class="text-sm">Purpose: Full exercise routine, walking, lunch break</span>
              </div>
            </div>
          </div>

          {/* Sessions Before Long Break */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="card-title text-2xl mb-1">Sessions Before Long Break</h2>
                  <p class="text-sm text-base-content/70">Number of work sessions before taking a long break</p>
                </div>
                <div class="badge badge-neutral badge-lg">{sessionsBeforeLongBreak()} sessions</div>
              </div>

              {/* Session Counter Buttons */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Select Sessions</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6, 8].map(count => (
                    <button
                      class={`btn ${sessionsBeforeLongBreak() === count ? 'btn-neutral' : 'btn-outline btn-neutral'}`}
                      onClick={() => setSessionsBeforeLongBreak(count)}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Visualization */}
              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-semibold">Progress Preview</span>
                  <span class="label-text-alt">Example cycle</span>
                </label>
                <div class="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: sessionsBeforeLongBreak() }).map((_, index) => (
                    <>
                      <div class="badge badge-primary badge-lg gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Work
                      </div>
                      {index < sessionsBeforeLongBreak() - 1 && (
                        <>
                          <span class="text-base-content/50">→</span>
                          <div class="badge badge-secondary">Short Break</div>
                          <span class="text-base-content/50">→</span>
                        </>
                      )}
                    </>
                  ))}
                  <span class="text-base-content/50">→</span>
                  <div class="badge badge-accent badge-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Long Break
                  </div>
                </div>
              </div>

              {/* Info */}
              <div class="stats shadow bg-base-100">
                <div class="stat">
                  <div class="stat-title">Total Cycle Time</div>
                  <div class="stat-value text-2xl">
                    {workDuration() * sessionsBeforeLongBreak() +
                     shortBreakDuration() * (sessionsBeforeLongBreak() - 1) +
                     longBreakDuration()} min
                  </div>
                  <div class="stat-desc">
                    {Math.floor((workDuration() * sessionsBeforeLongBreak() +
                     shortBreakDuration() * (sessionsBeforeLongBreak() - 1) +
                     longBreakDuration()) / 60)}h {(workDuration() * sessionsBeforeLongBreak() +
                     shortBreakDuration() * (sessionsBeforeLongBreak() - 1) +
                     longBreakDuration()) % 60}m per complete cycle
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Notification Settings */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="card-title text-2xl mb-1">Sound Notification</h2>
                  <p class="text-sm text-base-content/70">Play a sound when timer completes</p>
                </div>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-lg"
                    checked={soundEnabled()}
                    onChange={(e) => setSoundEnabled(e.currentTarget.checked)}
                  />
                  <span class="label-text text-lg">
                    {soundEnabled() ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div class="alert alert-info mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm">A notification sound will play when your work session or break ends</span>
              </div>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <Show when={hasChanges()}>
                <div class="alert alert-warning mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>You have unsaved changes</span>
                </div>
              </Show>

              <div class="flex gap-3 justify-end">
                <button
                  class="btn btn-ghost"
                  onClick={handleReset}
                >
                  Reset to Defaults
                </button>
                <button
                  class="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={!hasChanges() || isSaving()}
                >
                  <Show when={isSaving()} fallback={
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }>
                    <span class="loading loading-spinner"></span>
                  </Show>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </main>
  );
};

export default TimerSettingsPage;
