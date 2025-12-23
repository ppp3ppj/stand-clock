import { Route, A } from "@solidjs/router";
import { ParentComponent } from "solid-js";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import TimerSettingsPage from "./pages/TimerSettingsPage";
import StatisticsPage from "./pages/StatisticsPage";
import "./App.css";

const Layout: ParentComponent = (props) => {
  return (
    <>
      <nav class="navbar bg-base-100 shadow-lg mb-4">
        <div class="flex-1">
          <A href="/" class="btn btn-ghost text-xl">Stand Clock</A>
        </div>
        <div class="flex-none gap-2">
          <A href="/statistics" class="btn btn-ghost">
            <i class="ri-bar-chart-line"></i>
            Statistics
          </A>
          <A href="/timer-settings" class="btn btn-ghost">
            <i class="ri-timer-line"></i>
            Timer
          </A>
          <A href="/settings" class="btn btn-ghost">
            <i class="ri-palette-line"></i>
            Theme
          </A>
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
