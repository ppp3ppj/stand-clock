import { Route, A } from "@solidjs/router";
import { ParentComponent } from "solid-js";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import TimerSettingsPage from "./pages/TimerSettingsPage";
import "./App.css";

const Layout: ParentComponent = (props) => {
  return (
    <>
      <nav class="navbar bg-base-100 shadow-lg mb-4">
        <div class="flex-1">
          <A href="/" class="btn btn-ghost text-xl">Stand Clock</A>
        </div>
        <div class="flex-none gap-2">
          <A href="/timer-settings" class="btn btn-ghost">
            <i class="ri-timer-line text-lg"></i>
            Timer
          </A>
          <A href="/settings" class="btn btn-ghost">
            <i class="ri-settings-3-line text-lg"></i>
            Settings
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
      <Route path="/timer-settings" component={TimerSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
    </Route>
  );
}

export default App;
