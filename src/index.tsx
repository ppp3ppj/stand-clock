/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerSettingsProvider } from "./contexts/TimerSettingsContext";
import { EyeCareProvider } from "./contexts/EyeCareContext";
import { SessionHistoryProvider } from "./contexts/SessionHistoryContext";
import App from "./App";
import 'remixicon/fonts/remixicon.css';

render(() => (
  <ThemeProvider>
    <TimerSettingsProvider>
      <EyeCareProvider>
        <SessionHistoryProvider>
          <Router>
            <App />
          </Router>
        </SessionHistoryProvider>
      </EyeCareProvider>
    </TimerSettingsProvider>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
