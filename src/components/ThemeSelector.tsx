import { Component, For } from 'solid-js';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector: Component = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div class="space-y-4">
      {/* Theme Dropdown */}
      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text font-semibold">Choose Theme</span>
          <span class="label-text-alt text-xs opacity-60">{themes.length} themes</span>
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
      </div>

      {/* Theme Preview */}
      <div class="bg-base-200 rounded-lg p-4">
        <p class="text-sm font-semibold mb-3 opacity-70">Color Preview</p>
        <div class="flex gap-2 flex-wrap">
          <div class="badge badge-primary gap-2">
            <i class="ri-palette-fill"></i>
            Primary
          </div>
          <div class="badge badge-secondary gap-2">
            <i class="ri-palette-fill"></i>
            Secondary
          </div>
          <div class="badge badge-accent gap-2">
            <i class="ri-palette-fill"></i>
            Accent
          </div>
          <div class="badge badge-neutral gap-2">
            <i class="ri-palette-fill"></i>
            Neutral
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
