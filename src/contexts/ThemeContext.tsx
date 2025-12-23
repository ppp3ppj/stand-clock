/**
 * Theme Context
 * Manages theme selection with localStorage persistence
 * Supports DaisyUI themes with proper type safety
 */

import { createContext, useContext, createSignal, createEffect, ParentComponent } from "solid-js";

const DAISY_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
] as const;

type Theme = typeof DAISY_THEMES[number];

interface ThemeContextValue {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
}

const ThemeContext = createContext<ThemeContextValue>();

const STORAGE_KEY = 'daisy-theme';
const DEFAULT_THEME: Theme = 'light';

/**
 * Get saved theme from localStorage with fallback
 */
function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved && DAISY_THEMES.includes(saved as Theme)) ? (saved as Theme) : DEFAULT_THEME;
  } catch (error) {
    console.warn("[ThemeContext] Failed to read theme from localStorage:", error);
    return DEFAULT_THEME;
  }
}

/**
 * Save theme to localStorage
 */
function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn("[ThemeContext] Failed to save theme to localStorage:", error);
  }
}

/**
 * Provider for theme management with localStorage persistence
 */
export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setTheme] = createSignal<Theme>(getSavedTheme());

  // Apply theme to document element
  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  // Persist theme to localStorage
  createEffect(() => {
    saveTheme(theme());
  });

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themes: DAISY_THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
