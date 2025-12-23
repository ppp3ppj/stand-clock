/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerSettingsProvider } from "./contexts/TimerSettingsContext";
import { SessionTrackingProvider } from "./contexts/SessionTrackingContext";
import App from "./App";
import 'remixicon/fonts/remixicon.css';

render(() => (
  <ThemeProvider>
    <TimerSettingsProvider>
      <SessionTrackingProvider>
        <Router>
          <App />
        </Router>
      </SessionTrackingProvider>
    </TimerSettingsProvider>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
