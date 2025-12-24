import { Route, A } from "@solidjs/router";
import { ParentComponent } from "solid-js";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import TimerSettingsPage from "./pages/TimerSettingsPage";
import "./App.css";

const Layout: ParentComponent = (props) => {
  return (
    <div class="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside class="w-20 bg-base-200 flex flex-col items-center py-6 gap-6 shadow-xl">
        {/* Logo/Brand */}
        <A href="/" class="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
          <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <i class="ri-time-line text-2xl text-primary-content"></i>
          </div>
        </A>

        <div class="divider my-0"></div>

        {/* Navigation Icons */}
        <nav class="flex flex-col gap-4">
          <A
            href="/"
            class="btn btn-ghost btn-square btn-lg flex flex-col gap-1 h-auto py-3"
            activeClass="btn-primary"
            title="Timer"
          >
            <i class="ri-timer-line text-2xl"></i>
            <span class="text-xs">Timer</span>
          </A>

          <A
            href="/timer-settings"
            class="btn btn-ghost btn-square btn-lg flex flex-col gap-1 h-auto py-3"
            activeClass="btn-primary"
            title="Timer Settings"
          >
            <i class="ri-settings-4-line text-2xl"></i>
            <span class="text-xs">Setup</span>
          </A>

          <A
            href="/settings"
            class="btn btn-ghost btn-square btn-lg flex flex-col gap-1 h-auto py-3"
            activeClass="btn-primary"
            title="Settings"
          >
            <i class="ri-palette-line text-2xl"></i>
            <span class="text-xs">Theme</span>
          </A>
        </nav>
      </aside>

      {/* Main Content */}
      <main class="flex-1 overflow-y-auto">
        {props.children}
      </main>
    </div>
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
