import { Component, createSignal, createEffect } from 'solid-js';
import { getVersion, getName } from '@tauri-apps/api/app';
import ThemeSelector from '../components/ThemeSelector';
import DevTools from '../components/DevTools';

const SettingsPage: Component = () => {
  const [showDevTools, setShowDevTools] = createSignal(false);
  const [appInfo, setAppInfo] = createSignal<string>('Stand Clock v?.?.?');

  createEffect(() => {
    const loadAppInfo = async () => {
      try {
        const productName = await getName();
        const version = await getVersion();
        setAppInfo(`${productName} v${version}`);
      } catch (err) {
        console.warn('Failed to load app info:', err);
        setAppInfo('Stand Clock v0.1.0');
      }
    };

    loadAppInfo();
  });

  return (
    <div class="h-full flex flex-col">
      {/* Header - Sticky */}
      <div class="flex-none bg-base-200 px-6 sm:px-8 py-6 shadow-sm">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl sm:text-4xl font-bold mb-2">Settings</h1>
          <p class="text-base-content/60">Customize your Stand Clock experience</p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
        <div class="max-w-4xl mx-auto space-y-6">

          {/* Appearance */}
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4 sm:p-6">
              <h2 class="card-title text-xl mb-4">
                <i class="ri-palette-line text-2xl"></i>
                Appearance
              </h2>
              <ThemeSelector />
            </div>
          </div>

          {/* Developer Tools */}
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex-1">
                  <h2 class="card-title text-xl mb-2">
                    <i class="ri-tools-line text-2xl"></i>
                    Developer Tools
                  </h2>
                  <p class="text-sm text-base-content/60">
                    Testing utilities for development and debugging
                  </p>
                </div>
                <button
                  class="btn btn-sm sm:btn-md btn-outline gap-2"
                  onClick={() => setShowDevTools(!showDevTools())}
                >
                  <i class={`ri-${showDevTools() ? 'eye-off' : 'eye'}-line text-lg`}></i>
                  {showDevTools() ? 'Hide' : 'Show'} Tools
                </button>
              </div>

              {showDevTools() && (
                <div class="mt-6 pt-6 border-t border-base-300">
                  <DevTools />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer - Version Display */}
      <div class="flex-none border-t border-base-300 bg-base-200 px-6 sm:px-8 py-3">
        <div class="max-w-4xl mx-auto text-center">
          <div class="flex items-center justify-center gap-2 text-xs text-base-content/60">
            <i class="ri-information-line"></i>
            <span>{appInfo()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
