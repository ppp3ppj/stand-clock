import { Component, createSignal, Show, For } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';
import { appDataDir, appConfigDir } from '@tauri-apps/api/path';

const DevTools: Component = () => {
  const { settings, updateSettings } = useTimerSettings();
  const [testOutput, setTestOutput] = createSignal<string>('');
  const [showSuccess, setShowSuccess] = createSignal(false);

  // Quick Timer Presets for Testing
  const quickTimerPresets = [
    { name: 'Ultra Fast', work: 10/60, short: 5/60, long: 10/60, sessions: 2, icon: 'ri-flashlight-fill' },
    { name: 'Fast Test', work: 30/60, short: 15/60, long: 1, sessions: 2, icon: 'ri-speed-fill' },
    { name: 'Quick Test', work: 1, short: 30/60, long: 2, sessions: 2, icon: 'ri-timer-flash-line' },
    { name: 'Production', work: 25, short: 5, long: 15, sessions: 4, icon: 'ri-restart-line' },
  ];

  const applyQuickPreset = async (preset: typeof quickTimerPresets[0]) => {
    await updateSettings({
      workDuration: preset.work,
      shortBreakDuration: preset.short,
      longBreakDuration: preset.long,
      sessionsBeforeLongBreak: preset.sessions,
      soundEnabled: settings().soundEnabled,
      defaultBreakActivity: settings().defaultBreakActivity,
      showCyclePreview: settings().showCyclePreview,
    });
    showSuccessMessage(`Applied: ${preset.name}`);
  };

  const showSuccessMessage = (message: string) => {
    setTestOutput(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // LocalStorage Inspector
  const [showStorage, setShowStorage] = createSignal(false);
  const [localStorageData, setLocalStorageData] = createSignal<Record<string, any>>({});

  const inspectLocalStorage = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(data);
    setShowStorage(true);
    showSuccessMessage('LocalStorage data loaded');
  };

  const clearLocalStorage = () => {
    if (confirm('Clear all localStorage? This will reset settings. Refresh required.')) {
      localStorage.clear();
      setLocalStorageData({});
      showSuccessMessage('LocalStorage cleared - please refresh');
    }
  };

  // Database Location Inspector
  const [showDbPath, setShowDbPath] = createSignal(false);
  const [dbPath, setDbPath] = createSignal<string>('');

  const inspectDbLocation = async () => {
    try {
      // Get both config and data directories
      // Tauri SQL plugin uses different directories on different platforms:
      // - Linux: appConfigDir
      // - Windows/macOS: appDataDir
      const [configDir, dataDir] = await Promise.all([
        appConfigDir(),
        appDataDir()
      ]);

      // Determine which directory to use based on platform
      // Linux paths typically contain /home/, Windows paths contain \Users\ or C:\
      const isLinux = configDir.includes('/home/') || configDir.startsWith('/');
      const baseDir = isLinux ? configDir : dataDir;

      // Determine platform-specific separator
      const pathSeparator = baseDir.includes('\\') ? '\\' : '/';
      // Check if path already ends with a separator
      const separator = baseDir.endsWith('\\') || baseDir.endsWith('/') ? '' : pathSeparator;
      const fullPath = `${baseDir}${separator}standclock.db`;

      setDbPath(fullPath);
      setShowDbPath(true);
      showSuccessMessage('Database location loaded');
    } catch (error) {
      showSuccessMessage('Failed to get DB path');
      console.error('DB path error:', error);
    }
  };

  // Notification Test
  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Stand Clock Test', {
          body: 'Test notification from DevTools',
          icon: '/favicon.ico',
        });
        showSuccessMessage('Notification sent!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Stand Clock Test', {
              body: 'Permission granted!',
              icon: '/favicon.ico',
            });
            showSuccessMessage('Permission granted!');
          }
        });
      } else {
        showSuccessMessage('Notifications blocked');
      }
    } else {
      showSuccessMessage('Notifications not supported');
    }
  };

  return (
    <div class="space-y-4">
      {/* Success Toast */}
      <Show when={showSuccess()}>
        <div class="toast toast-top toast-end z-50">
          <div class="alert alert-success shadow-lg">
            <i class="ri-checkbox-circle-line text-xl"></i>
            <span class="text-sm">{testOutput()}</span>
          </div>
        </div>
      </Show>

      {/* Quick Timer Presets */}
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <i class="ri-timer-line text-lg"></i>
          <h3 class="font-semibold">Quick Timer Presets</h3>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <For each={quickTimerPresets}>
            {(preset) => (
              <button
                class="btn btn-sm btn-outline gap-2"
                onClick={() => applyQuickPreset(preset)}
              >
                <i class={preset.icon}></i>
                {preset.name}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="divider my-2"></div>

      {/* Utilities */}
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <i class="ri-tools-fill text-lg"></i>
          <h3 class="font-semibold">Utilities</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            class="btn btn-sm btn-outline gap-2"
            onClick={inspectLocalStorage}
          >
            <i class="ri-database-2-line"></i>
            Inspect Storage
          </button>
          <button
            class="btn btn-sm btn-outline gap-2"
            onClick={inspectDbLocation}
          >
            <i class="ri-folder-line"></i>
            DB Location
          </button>
          <button
            class="btn btn-sm btn-outline btn-error gap-2"
            onClick={clearLocalStorage}
          >
            <i class="ri-delete-bin-line"></i>
            Clear Storage
          </button>
          <button
            class="btn btn-sm btn-outline gap-2"
            onClick={testNotification}
          >
            <i class="ri-notification-3-line"></i>
            Test Notification
          </button>
          <button
            class="btn btn-sm btn-outline gap-2"
            onClick={() => window.location.reload()}
          >
            <i class="ri-refresh-line"></i>
            Reload App
          </button>
        </div>
      </div>

      {/* Storage Data */}
      <Show when={showStorage() && Object.keys(localStorageData()).length > 0}>
        <div class="divider my-2"></div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="ri-file-list-line text-lg"></i>
              <h3 class="font-semibold">Storage Data</h3>
            </div>
            <button
              class="btn btn-xs btn-ghost"
              onClick={() => setShowStorage(false)}
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <For each={Object.entries(localStorageData())}>
                  {([key, value]) => (
                    <tr>
                      <td class="font-mono text-xs">{key}</td>
                      <td class="font-mono text-xs max-w-xs truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Database Location */}
      <Show when={showDbPath()}>
        <div class="divider my-2"></div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="ri-database-line text-lg"></i>
              <h3 class="font-semibold">Database Location</h3>
            </div>
            <button
              class="btn btn-xs btn-ghost"
              onClick={() => setShowDbPath(false)}
            >
              <i class="ri-close-line"></i>
            </button>
          </div>
          <div class="bg-base-200 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <i class="ri-folder-open-line text-lg mt-0.5"></i>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-mono break-all">{dbPath()}</p>
              </div>
              <button
                class="btn btn-xs btn-ghost"
                onClick={() => {
                  navigator.clipboard.writeText(dbPath());
                  showSuccessMessage('Path copied to clipboard');
                }}
              >
                <i class="ri-file-copy-line"></i>
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Current State */}
      <div class="divider my-2"></div>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <i class="ri-code-box-line text-lg"></i>
          <h3 class="font-semibold">Current Settings</h3>
        </div>
        <div class="mockup-code text-xs">
          <pre><code>{JSON.stringify(settings(), null, 2)}</code></pre>
        </div>
      </div>

      {/* System Info */}
      <div class="divider my-2"></div>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <i class="ri-information-line text-lg"></i>
          <h3 class="font-semibold">System Info</h3>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 bg-base-200 rounded">
            <div class="opacity-60 mb-1">Language</div>
            <div class="font-mono">{navigator.language}</div>
          </div>
          <div class="p-2 bg-base-200 rounded">
            <div class="opacity-60 mb-1">Window Size</div>
            <div class="font-mono">{window.innerWidth} x {window.innerHeight}</div>
          </div>
          <div class="p-2 bg-base-200 rounded">
            <div class="opacity-60 mb-1">Online</div>
            <div class="font-mono">{navigator.onLine ? 'Yes' : 'No'}</div>
          </div>
          <div class="p-2 bg-base-200 rounded">
            <div class="opacity-60 mb-1">Notifications</div>
            <div class="font-mono">{('Notification' in window) ? 'Supported' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTools;
