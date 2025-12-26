import { Component, createSignal, Show, For } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';
import { ActivityType } from '../repositories/SessionHistoryRepository';
import notificationSound from '../assets/sounds/mixkit-notification-bell-592.wav';

const TimerSettingsPage: Component = () => {
  const { settings, updateSettings, resetToDefaults, isLoading } = useTimerSettings();

  // Local state for UI (synced with context)
  const [workDuration, setWorkDuration] = createSignal(settings().workDuration);
  const [shortBreakDuration, setShortBreakDuration] = createSignal(settings().shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = createSignal(settings().longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = createSignal(settings().sessionsBeforeLongBreak);
  const [soundEnabled, setSoundEnabled] = createSignal(settings().soundEnabled);
  const [defaultBreakActivity, setDefaultBreakActivity] = createSignal(settings().defaultBreakActivity);
  const [showCyclePreview, setShowCyclePreview] = createSignal(settings().showCyclePreview);
  const [isSaving, setIsSaving] = createSignal(false);

  // Watch for settings changes
  const hasChanges = () => {
    return (
      workDuration() !== settings().workDuration ||
      shortBreakDuration() !== settings().shortBreakDuration ||
      longBreakDuration() !== settings().longBreakDuration ||
      sessionsBeforeLongBreak() !== settings().sessionsBeforeLongBreak ||
      soundEnabled() !== settings().soundEnabled ||
      defaultBreakActivity() !== settings().defaultBreakActivity ||
      showCyclePreview() !== settings().showCyclePreview
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
      defaultBreakActivity: defaultBreakActivity(),
      showCyclePreview: showCyclePreview(),
    });
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (confirm('Reset to default settings?')) {
      await resetToDefaults();
      setWorkDuration(settings().workDuration);
      setShortBreakDuration(settings().shortBreakDuration);
      setLongBreakDuration(settings().longBreakDuration);
      setSessionsBeforeLongBreak(settings().sessionsBeforeLongBreak);
      setSoundEnabled(settings().soundEnabled);
      setDefaultBreakActivity(settings().defaultBreakActivity);
      setShowCyclePreview(settings().showCyclePreview);
    }
  };

  const playTestSound = () => {
    const audio = new Audio(notificationSound);
    audio.volume = 0.6;
    audio.play().catch(err => console.log("Test sound failed:", err));
  };

  // Generate timeline data
  const timelineData = () => {
    const items = [];
    for (let i = 0; i < sessionsBeforeLongBreak(); i++) {
      items.push({ type: 'work', number: i + 1 });
      if (i < sessionsBeforeLongBreak() - 1) {
        items.push({ type: 'short' });
      }
    }
    items.push({ type: 'long' });
    return items;
  };

  return (
    <div class="h-full flex flex-col">
      {/* Header - Sticky */}
      <div class="flex-none bg-base-200 px-6 sm:px-8 py-6 shadow-sm">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl sm:text-4xl font-bold mb-2">Timer Settings</h1>
          <p class="text-base-content/60">Customize your work and break durations</p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
        <Show when={!isLoading()} fallback={
          <div class="flex justify-center items-center h-full">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        }>
          <div class="max-w-4xl mx-auto space-y-6">

            {/* Timer Durations - Simplified Card */}
            <div class="card bg-base-100 shadow-md">
              <div class="card-body p-4 sm:p-6">
                <h2 class="card-title text-xl mb-4">Timer Durations</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Work Duration */}
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-semibold">Work</span>
                      <span class="label-text-alt badge badge-primary">{workDuration()} min</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={workDuration()}
                      class="range range-primary range-sm"
                      step="5"
                      onInput={(e) => setWorkDuration(parseInt(e.currentTarget.value))}
                    />
                    <div class="flex justify-between text-xs mt-1 px-1 opacity-60">
                      <span>5</span>
                      <span>120</span>
                    </div>
                  </div>

                  {/* Short Break Duration */}
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-semibold">Short Break</span>
                      <span class="label-text-alt badge badge-secondary">{shortBreakDuration()} min</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={shortBreakDuration()}
                      class="range range-secondary range-sm"
                      step="1"
                      onInput={(e) => setShortBreakDuration(parseInt(e.currentTarget.value))}
                    />
                    <div class="flex justify-between text-xs mt-1 px-1 opacity-60">
                      <span>1</span>
                      <span>15</span>
                    </div>
                  </div>

                  {/* Long Break Duration */}
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-semibold">Long Break</span>
                      <span class="label-text-alt badge badge-accent">{longBreakDuration()} min</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      value={longBreakDuration()}
                      class="range range-accent range-sm"
                      step="5"
                      onInput={(e) => setLongBreakDuration(parseInt(e.currentTarget.value))}
                    />
                    <div class="flex justify-between text-xs mt-1 px-1 opacity-60">
                      <span>10</span>
                      <span>30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions & Cycle Preview */}
            <div class="card bg-base-100 shadow-md">
              <div class="card-body p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h2 class="card-title text-xl">Cycle Configuration</h2>
                  <div class="stats stats-horizontal shadow bg-base-200 text-sm">
                    <div class="stat py-2 px-4">
                      <div class="stat-title text-xs">Sessions</div>
                      <div class="stat-value text-2xl">{sessionsBeforeLongBreak()}</div>
                    </div>
                    <div class="stat py-2 px-4">
                      <div class="stat-title text-xs">Cycle Time</div>
                      <div class="stat-value text-2xl">
                        {Math.floor((workDuration() * sessionsBeforeLongBreak() +
                                     shortBreakDuration() * (sessionsBeforeLongBreak() - 1) +
                                     longBreakDuration()) / 60)}h
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions Before Long Break */}
                <div class="form-control mb-6">
                  <label class="label">
                    <span class="label-text font-semibold">Work sessions before long break</span>
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <For each={[2, 3, 4, 5, 6, 8]}>
                      {(count) => (
                        <button
                          class={`btn btn-sm ${sessionsBeforeLongBreak() === count ? 'btn-neutral' : 'btn-outline btn-neutral'}`}
                          onClick={() => setSessionsBeforeLongBreak(count)}
                        >
                          {count}
                        </button>
                      )}
                    </For>
                  </div>
                </div>

                {/* Cycle Preview Toggle */}
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      class="toggle toggle-sm"
                      checked={showCyclePreview()}
                      onChange={(e) => setShowCyclePreview(e.currentTarget.checked)}
                    />
                    <span class="label-text font-semibold">Show Cycle Preview</span>
                  </label>
                </div>

                {/* Cycle Preview - Vertical Timeline */}
                <Show when={showCyclePreview()}>
                  <div class="form-control mt-4">
                    <div class="bg-base-200 rounded-lg p-4">
                      <ul class="timeline timeline-vertical timeline-compact">
                        <For each={timelineData()}>
                          {(item) => (
                            <li>
                              <div class="timeline-start text-xs opacity-60 w-16 text-right pr-2">
                                {item.type === 'work' ? workDuration() : item.type === 'short' ? shortBreakDuration() : longBreakDuration()}m
                              </div>
                              <div class="timeline-middle">
                                <div class={`w-3 h-3 rounded-full ${item.type === 'work' ? 'bg-primary' : item.type === 'short' ? 'bg-secondary' : 'bg-accent'}`}></div>
                              </div>
                              <div class={`timeline-end timeline-box text-xs mb-4 ${item.type === 'work' ? 'bg-primary text-primary-content' : item.type === 'short' ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}`}>
                                {item.type === 'work' ? (
                                  <>
                                    <i class="ri-focus-line"></i> Work #{item.number}
                                  </>
                                ) : item.type === 'short' ? (
                                  <>
                                    <i class="ri-cup-line"></i> Short Break
                                  </>
                                ) : (
                                  <>
                                    <i class="ri-restaurant-line"></i> Long Break
                                  </>
                                )}
                              </div>
                              <hr class={item.type === 'work' ? 'bg-primary' : item.type === 'short' ? 'bg-secondary' : 'bg-accent'} />
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  </div>
                </Show>
              </div>
            </div>

            {/* Preferences */}
            <div class="card bg-base-100 shadow-md">
              <div class="card-body p-4 sm:p-6">
                <h2 class="card-title text-xl mb-4">Preferences</h2>

                <div class="space-y-6">
                  {/* Sound Notifications */}
                  <div class="form-control">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div class="flex items-center gap-4">
                        <input
                          type="checkbox"
                          class="toggle toggle-primary"
                          checked={soundEnabled()}
                          onChange={(e) => setSoundEnabled(e.currentTarget.checked)}
                        />
                        <div>
                          <span class="label-text font-semibold block">Sound Notifications</span>
                          <span class="label-text-alt opacity-60">Play sound when timer ends</span>
                        </div>
                      </div>
                      <Show when={soundEnabled()}>
                        <button
                          class="btn btn-sm btn-outline gap-2"
                          onClick={playTestSound}
                        >
                          <i class="ri-volume-up-line"></i>
                          Test Sound
                        </button>
                      </Show>
                    </div>
                  </div>

                  <div class="divider my-0"></div>

                  {/* Default Break Activity */}
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-semibold">Default Break Activity</span>
                      <span class="label-text-alt opacity-60">
                        {defaultBreakActivity() === 'ask' ? 'Show popup' : 'Auto-set'}
                      </span>
                    </label>
                    <select
                      class="select select-bordered w-full"
                      value={defaultBreakActivity()}
                      onChange={(e) => setDefaultBreakActivity(e.currentTarget.value as ActivityType | 'ask')}
                    >
                      <option value="ask">Ask every time</option>
                      <option value="stretch">🧘 Stretch</option>
                      <option value="walk">🚶 Walk</option>
                      <option value="exercise">🏃 Exercise</option>
                      <option value="hydrate">☕ Hydrate</option>
                      <option value="rest">😴 Rest</option>
                      <option value="other">⚙️ Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Show>
      </div>

      {/* Footer - Sticky Actions */}
      <div class="flex-none bg-base-200 px-6 sm:px-8 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-base-300">
        <div class="max-w-4xl mx-auto">
          <Show when={hasChanges()}>
            <div class="alert alert-warning mb-3 py-2">
              <i class="ri-error-warning-line text-lg"></i>
              <span class="text-sm">You have unsaved changes</span>
            </div>
          </Show>

          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              class="btn btn-outline btn-sm sm:btn-md"
              onClick={handleReset}
            >
              <i class="ri-restart-line"></i>
              Reset to Defaults
            </button>
            <button
              class="btn btn-primary btn-sm sm:btn-md"
              onClick={handleSave}
              disabled={!hasChanges() || isSaving()}
            >
              <Show when={isSaving()} fallback={
                <i class="ri-save-line"></i>
              }>
                <span class="loading loading-spinner loading-sm"></span>
              </Show>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerSettingsPage;
