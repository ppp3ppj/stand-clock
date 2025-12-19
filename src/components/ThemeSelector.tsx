import { Component, For } from 'solid-js';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector: Component = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">Choose Theme</span>
      </label>
      <select
        class="select select-bordered w-full"
        value={theme()}
        onChange={(e) => setTheme(e.currentTarget.value as any)}
      >
        <For each={themes}>
          {(themeName) => (
            <option value={themeName}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </option>
          )}
        </For>
      </select>

      <div class="mt-4 p-4 bg-base-200 rounded-lg">
        <p class="text-sm mb-2">Preview:</p>
        <div class="flex gap-2 flex-wrap">
          <div class="badge badge-primary">Primary</div>
          <div class="badge badge-secondary">Secondary</div>
          <div class="badge badge-accent">Accent</div>
          <div class="badge badge-neutral">Neutral</div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
