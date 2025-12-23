import { Component } from 'solid-js';
import ThemeSelector from '../components/ThemeSelector';
import { TimerRunningAlert } from '../components/TimerRunningAlert';

const SettingsPage: Component = () => {
  return (
    <main class="container mx-auto p-8">
      <TimerRunningAlert />
      
      <h1 class="text-3xl font-bold mb-6">Settings</h1>

      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Appearance</h2>
          <ThemeSelector />
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
