import { Component, createSignal, Show, For } from 'solid-js';
import { useTimerSettings } from '../contexts/TimerSettingsContext';

const DevTools: Component = () => {
  const { settings, updateSettings } = useTimerSettings();
  const [testOutput, setTestOutput] = createSignal<string>('');
  const [showSuccess, setShowSuccess] = createSignal(false);

  // Quick Timer Presets for Testing
  // Note: Using exact decimal values to avoid floating-point precision issues
  const quickTimerPresets = [
    { name: 'Ultra Fast (10s/5s/10s)', work: 10/60, short: 5/60, long: 10/60, sessions: 2 },
    { name: 'Fast (30s/15s/1m)', work: 30/60, short: 15/60, long: 1, sessions: 2 },
    { name: 'Quick Test (1m/30s/2m)', work: 1, short: 30/60, long: 2, sessions: 2 },
    { name: 'Medium Test (2m/1m/3m)', work: 2, short: 1, long: 3, sessions: 3 },
    { name: 'Reset to Production', work: 50, short: 5, long: 10, sessions: 4 },
  ];

  const applyQuickPreset = async (preset: typeof quickTimerPresets[0]) => {
    await updateSettings({
      workDuration: preset.work,
      shortBreakDuration: preset.short,
      longBreakDuration: preset.long,
      sessionsBeforeLongBreak: preset.sessions,
      soundEnabled: settings().soundEnabled,
    });
    showSuccessMessage(`Applied: ${preset.name}`);
  };

  const showSuccessMessage = (message: string) => {
    setTestOutput(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // LocalStorage Inspector
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
    showSuccessMessage('LocalStorage data loaded');
  };

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear all localStorage? This will reset all settings!')) {
      localStorage.clear();
      setLocalStorageData({});
      showSuccessMessage('LocalStorage cleared - refresh the page to see changes');
    }
  };

  // State Inspector
  const [showStateInspector, setShowStateInspector] = createSignal(false);

  const inspectCurrentState = () => {
    setShowStateInspector(!showStateInspector());
  };

  // Notification Test
  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Stand Clock Test', {
          body: 'This is a test notification from DevTools',
          icon: '/favicon.ico',
        });
        showSuccessMessage('Notification sent!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Stand Clock Test', {
              body: 'Notification permission granted!',
              icon: '/favicon.ico',
            });
            showSuccessMessage('Permission granted and notification sent!');
          }
        });
      } else {
        showSuccessMessage('Notifications are blocked');
      }
    } else {
      showSuccessMessage('Notifications not supported');
    }
  };

  // Performance Stats
  const [performanceStats, setPerformanceStats] = createSignal<any>(null);

  const checkPerformance = () => {
    if ('performance' in window) {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      setPerformanceStats({
        loadTime: Math.round(perf.loadEventEnd - perf.fetchStart),
        domReady: Math.round(perf.domContentLoadedEventEnd - perf.fetchStart),
        ttfb: Math.round(perf.responseStart - perf.requestStart),
      });
      showSuccessMessage('Performance stats loaded');
    }
  };

  // Console Logger
  const logToConsole = (type: 'info' | 'warn' | 'error' | 'table') => {
    const data = {
      timestamp: new Date().toISOString(),
      settings: settings(),
      localStorage: Object.keys(localStorage).length,
      userAgent: navigator.userAgent,
    };

    switch (type) {
      case 'table':
        console.table(data);
        break;
      case 'error':
        console.error('DevTools Error Test:', data);
        break;
      case 'warn':
        console.warn('DevTools Warning Test:', data);
        break;
      default:
        console.log('DevTools Info:', data);
    }
    showSuccessMessage(`Logged to console as ${type}`);
  };

  return (
    <div class="space-y-6">
      {/* Success Toast */}
      <Show when={showSuccess()}>
        <div class="toast toast-top toast-end z-50">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{testOutput()}</span>
          </div>
        </div>
      </Show>

      {/* Quick Timer Presets */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">Quick Timer Presets</h2>
          <p class="text-sm text-base-content/70">Rapidly test different timer configurations</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <For each={quickTimerPresets}>
              {(preset) => (
                <button
                  class="btn btn-outline btn-primary justify-start"
                  onClick={() => applyQuickPreset(preset)}
                >
                  <i class="ri-time-line text-xl"></i>
                  {preset.name}
                </button>
              )}
            </For>
          </div>

          <div class="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span class="text-sm">These presets instantly update your timer settings for quick testing</span>
          </div>
        </div>
      </div>

      {/* State Inspector */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">State Inspector</h2>
          <p class="text-sm text-base-content/70">View current application state</p>

          <button
            class="btn btn-outline btn-secondary mt-4"
            onClick={inspectCurrentState}
          >
            <i class="ri-code-box-line text-xl"></i>
            {showStateInspector() ? 'Hide State' : 'Inspect State'}
          </button>

          <Show when={showStateInspector()}>
            <div class="mockup-code mt-4">
              <pre><code>{JSON.stringify(settings(), null, 2)}</code></pre>
            </div>
          </Show>
        </div>
      </div>

      {/* LocalStorage Tools */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">LocalStorage Tools</h2>
          <p class="text-sm text-base-content/70">Inspect and manage browser storage</p>

          <div class="flex gap-3 mt-4">
            <button
              class="btn btn-outline btn-info"
              onClick={inspectLocalStorage}
            >
              <i class="ri-database-2-line text-xl"></i>
              Inspect Storage
            </button>
            <button
              class="btn btn-outline btn-error"
              onClick={clearLocalStorage}
            >
              <i class="ri-delete-bin-line text-xl"></i>
              Clear Storage
            </button>
          </div>

          <Show when={Object.keys(localStorageData()).length > 0}>
            <div class="overflow-x-auto mt-4">
              <table class="table table-zebra">
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
                        <td class="font-mono text-sm">{key}</td>
                        <td class="font-mono text-xs max-w-md truncate">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      </div>

      {/* Browser Features */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">Browser Features Test</h2>
          <p class="text-sm text-base-content/70">Test browser APIs and features</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <button
              class="btn btn-outline btn-accent"
              onClick={testNotification}
            >
              <i class="ri-notification-3-line text-xl"></i>
              Test Notification
            </button>
            <button
              class="btn btn-outline btn-accent"
              onClick={checkPerformance}
            >
              <i class="ri-speed-line text-xl"></i>
              Check Performance
            </button>
          </div>

          <Show when={performanceStats()}>
            <div class="stats stats-vertical lg:stats-horizontal shadow mt-4 bg-base-100">
              <div class="stat">
                <div class="stat-title">Page Load</div>
                <div class="stat-value text-2xl">{performanceStats().loadTime}ms</div>
              </div>
              <div class="stat">
                <div class="stat-title">DOM Ready</div>
                <div class="stat-value text-2xl">{performanceStats().domReady}ms</div>
              </div>
              <div class="stat">
                <div class="stat-title">TTFB</div>
                <div class="stat-value text-2xl">{performanceStats().ttfb}ms</div>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Console Logging Tools */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">Console Logging</h2>
          <p class="text-sm text-base-content/70">Test different console output types</p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            <button
              class="btn btn-outline btn-sm"
              onClick={() => logToConsole('info')}
            >
              console.log
            </button>
            <button
              class="btn btn-outline btn-warning btn-sm"
              onClick={() => logToConsole('warn')}
            >
              console.warn
            </button>
            <button
              class="btn btn-outline btn-error btn-sm"
              onClick={() => logToConsole('error')}
            >
              console.error
            </button>
            <button
              class="btn btn-outline btn-success btn-sm"
              onClick={() => logToConsole('table')}
            >
              console.table
            </button>
          </div>

          <div class="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm">Open browser DevTools console (F12) to see the output</span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl">System Information</h2>
          <p class="text-sm text-base-content/70">Browser and environment details</p>

          <div class="overflow-x-auto mt-4">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td class="font-semibold">User Agent</td>
                  <td class="font-mono text-xs">{navigator.userAgent}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Platform</td>
                  <td class="font-mono">{navigator.platform}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Language</td>
                  <td class="font-mono">{navigator.language}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Online</td>
                  <td class="font-mono">{navigator.onLine ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Screen Resolution</td>
                  <td class="font-mono">{screen.width} x {screen.height}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Window Size</td>
                  <td class="font-mono">{window.innerWidth} x {window.innerHeight}</td>
                </tr>
                <tr>
                  <td class="font-semibold">LocalStorage Support</td>
                  <td class="font-mono">{typeof Storage !== 'undefined' ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td class="font-semibold">Notifications Support</td>
                  <td class="font-mono">{('Notification' in window) ? 'Yes' : 'No'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTools;
