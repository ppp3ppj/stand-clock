import { Route, A } from "@solidjs/router";
import { ParentComponent, Show } from "solid-js";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import TimerSettingsPage from "./pages/TimerSettingsPage";
import StatisticsPage from "./pages/StatisticsPage";
import { ProtectedLink } from "./components/ProtectedLink";
import { useSessionTracking } from "./contexts/SessionTrackingContext";
import "./App.css";

const Layout: ParentComponent = (props) => {
  const { isTimerRunning } = useSessionTracking();

  const handleProtectedNavigation = (e: MouseEvent, href: string) => {
    if (isTimerRunning() && href !== "/") {
      const confirmLeave = confirm(
        "Timer is currently running. Leaving this page will pause the timer. Do you want to continue?"
      );
      
      if (!confirmLeave) {
        e.preventDefault();
      }
    }
  };

  return (
    <>
      <nav class="navbar bg-base-100 shadow-lg mb-4">
        <div class="flex-1">
          <A href="/" class="btn btn-ghost text-xl">
            Stand Clock
            <Show when={isTimerRunning()}>
              <span class="badge badge-primary badge-sm ml-2 animate-pulse">Running</span>
            </Show>
          </A>
        </div>
        <div class="flex-none gap-2">
          <a
            href="/statistics"
            class={`btn btn-ghost ${isTimerRunning() ? "opacity-60" : ""}`}
            onClick={(e) => handleProtectedNavigation(e, "/statistics")}
          >
            <i class="ri-bar-chart-line"></i>
            Statistics
          </a>
          <a
            href="/timer-settings"
            class={`btn btn-ghost ${isTimerRunning() ? "opacity-60" : ""}`}
            onClick={(e) => handleProtectedNavigation(e, "/timer-settings")}
          >
            <i class="ri-timer-line"></i>
            Timer
            <Show when={isTimerRunning()}>
              <i class="ri-lock-line text-xs ml-1"></i>
            </Show>
          </a>
          <a
            href="/settings"
            class={`btn btn-ghost ${isTimerRunning() ? "opacity-60" : ""}`}
            onClick={(e) => handleProtectedNavigation(e, "/settings")}
          >
            <i class="ri-palette-line"></i>
            Theme
            <Show when={isTimerRunning()}>
              <i class="ri-lock-line text-xs ml-1"></i>
            </Show>
          </a>
        </div>
      </nav>
      {props.children}
    </>
  );
};

function App() {
  return (
    <Route path="/" component={Layout}>
      <Route path="/" component={HomePage} />
      <Route path="/statistics" component={StatisticsPage} />
      <Route path="/timer-settings" component={TimerSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
    </Route>
  );
}

export default App;
