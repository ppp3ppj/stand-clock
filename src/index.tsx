/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TimerSettingsProvider } from "./contexts/TimerSettingsContext";
import { TimerProvider } from "./contexts/TimerContext";
import App from "./App";
import 'remixicon/fonts/remixicon.css';

render(() => (
  <ThemeProvider>
    <TimerSettingsProvider>
      <TimerProvider>
        <Router>
          <App />
        </Router>
      </TimerProvider>
    </TimerSettingsProvider>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
