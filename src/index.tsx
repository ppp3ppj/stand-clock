/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerSettingsProvider } from "./contexts/TimerSettingsContext";
import { SessionHistoryProvider } from "./contexts/SessionHistoryContext";
import App from "./App";
import 'remixicon/fonts/remixicon.css';

render(() => (
  <ThemeProvider>
    <TimerSettingsProvider>
      <SessionHistoryProvider>
        <Router>
          <App />
        </Router>
      </SessionHistoryProvider>
    </TimerSettingsProvider>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
