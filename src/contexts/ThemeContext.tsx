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

export const ThemeProvider: ParentComponent = (props) => {
  // Read initial theme from localStorage, fallback to 'light'
  const savedTheme = localStorage.getItem('daisy-theme') as Theme || 'light';
  const [theme, setTheme] = createSignal<Theme>(savedTheme);

  // Apply theme to document element
  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme());
  });

  // Persist theme to localStorage
  createEffect(() => {
    localStorage.setItem('daisy-theme', theme());
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
