/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerSettingsProvider } from "./contexts/TimerSettingsContext";
import App from "./App";

render(() => (
  <ThemeProvider>
    <TimerSettingsProvider>
      <Router>
        <App />
      </Router>
    </TimerSettingsProvider>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
