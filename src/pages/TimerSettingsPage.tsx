/**
 * Timer Settings Page Component
 * Allows users to configure work and break durations
 * Refactored following OOP, DRY, and clean code principles
 */

import { Component, Show } from "solid-js";
import { useTimerSettings } from "../contexts/TimerSettingsContext";
import { useTimerSettingsForm } from "../hooks/useTimerSettingsForm";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { DurationSlider } from "../components/DurationSlider";
import { SessionCycleVisualizer } from "../components/SessionCycleVisualizer";
import { SoundSettings } from "../components/SoundSettings";
import { TimerRunningAlert } from "../components/TimerRunningAlert";

const TimerSettingsPage: Component = () => {
  const { isLoading } = useTimerSettings();
  const form = useTimerSettingsForm();
  const { playTestNotification } = useSoundEffects(() => true);

  return (
    <main class="container mx-auto p-4 md:p-8 max-w-4xl">
      <Show
        when={!isLoading()}
        fallback={
          <div class="flex justify-center items-center h-96">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        }
      >
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-2">Timer Settings</h1>
          <p class="text-base-content/70">Customize your work and break durations</p>
        </div>

        <TimerRunningAlert />

        <div class="space-y-6">
          {/* Work Session Duration */}
          <DurationSlider
            title="Work Session Duration"
            description="Time spent working before a break"
            value={form.workDuration()}
            presets={[15, 25, 45, 50, 55]}
            min={5}
            max={120}
            step={5}
            badgeColor="primary"
            rangeColor="primary"
            onValueChange={form.setWorkDuration}
            recommendation="Recommended: 25-55 min based on research"
          />

          {/* Short Break Duration */}
          <DurationSlider
            title="Short Break Duration"
            description="Quick standing/stretching break"
            value={form.shortBreakDuration()}
            presets={[3, 5, 7, 10]}
            min={1}
            max={15}
            step={1}
            badgeColor="secondary"
            rangeColor="secondary"
            onValueChange={form.setShortBreakDuration}
            recommendation="Purpose: Quick posture reset, eye rest, light stretching"
          />

          {/* Long Break Duration */}
          <DurationSlider
            title="Long Break Duration"
            description="Extended break for deeper exercises"
            value={form.longBreakDuration()}
            presets={[10, 15, 20, 30]}
            min={10}
            max={30}
            step={5}
            badgeColor="accent"
            rangeColor="accent"
            onValueChange={form.setLongBreakDuration}
            recommendation="Purpose: Full exercise routine, walking, lunch break"
          />

          {/* Sessions Before Long Break */}
          <SessionCycleVisualizer
            sessionsBeforeLongBreak={form.sessionsBeforeLongBreak()}
            workDuration={form.workDuration()}
            shortBreakDuration={form.shortBreakDuration()}
            longBreakDuration={form.longBreakDuration()}
            onSessionsChange={form.setSessionsBeforeLongBreak}
          />

          {/* Sound Notification Settings */}
          <SoundSettings
            soundEnabled={form.soundEnabled()}
            onToggle={form.setSoundEnabled}
            onTestSound={playTestNotification}
          />

          {/* Save/Reset Buttons */}
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <Show when={form.hasChanges()}>
                <div class="alert alert-warning mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                  <span>You have unsaved changes</span>
                </div>
              </Show>

              <div class="flex gap-3 justify-end">
                <button class="btn btn-ghost" onClick={form.reset}>
                  Reset to Defaults
                </button>
                <button
                  class="btn btn-primary btn-lg"
                  onClick={form.save}
                  disabled={!form.hasChanges() || form.isSaving()}
                >
                  <Show
                    when={form.isSaving()}
                    fallback={<i class="ri-check-line text-2xl"></i>}
                  >
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
