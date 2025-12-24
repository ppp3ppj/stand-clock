import { Component, createSignal } from 'solid-js';
import ThemeSelector from '../components/ThemeSelector';
import DevTools from '../components/DevTools';

const SettingsPage: Component = () => {
  const [showDevTools, setShowDevTools] = createSignal(false);

  return (
    <div class="h-full flex flex-col">
      <div class="flex-none bg-base-200/50 px-8 py-6 border-b border-base-300">
        <h1 class="text-3xl font-bold">Settings</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="max-w-4xl mx-auto space-y-6">
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Appearance</h2>
            <ThemeSelector />
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="card-title">Developer Tools</h2>
                <p class="text-sm text-base-content/70 mt-1">
                  Testing utilities for development and debugging
                </p>
              </div>
              <button
                class="btn btn-outline btn-primary"
                onClick={() => setShowDevTools(!showDevTools())}
              >
                <i class={`ri-${showDevTools() ? 'arrow-up' : 'arrow-down'}-s-line text-xl`}></i>
                {showDevTools() ? 'Hide' : 'Show'} DevTools
              </button>
            </div>

            {showDevTools() && (
              <div class="mt-6">
                <DevTools />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
