/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App";

render(() => (
  <ThemeProvider>
    <Router>
      <App />
    </Router>
  </ThemeProvider>
), document.getElementById("root") as HTMLElement);
