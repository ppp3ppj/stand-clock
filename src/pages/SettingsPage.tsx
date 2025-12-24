import { Component, createSignal } from 'solid-js';
import ThemeSelector from '../components/ThemeSelector';
import DevTools from '../components/DevTools';

const SettingsPage: Component = () => {
  const [showDevTools, setShowDevTools] = createSignal(false);

  return (
    <main class="container mx-auto p-8 max-w-6xl">
      <h1 class="text-3xl font-bold mb-6">Settings</h1>

      <div class="space-y-6">
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
    </main>
  );
};

export default SettingsPage;
