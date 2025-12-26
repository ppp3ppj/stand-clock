import { Route, A } from "@solidjs/router";
import { ParentComponent } from "solid-js";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import TimerSettingsPage from "./pages/TimerSettingsPage";
import "./App.css";

const Layout: ParentComponent = (props) => {
  return (
    <div class="flex h-screen overflow-hidden">
      {/* Static Sidebar - Always Visible */}
      <aside class="w-16 bg-base-200 flex flex-col items-center py-4 gap-4 shadow-xl flex-shrink-0">
        {/* Logo/Brand */}
        <A
          href="/"
          class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center hover:scale-110 transition-transform"
          title="Stand Clock"
        >
          <i class="ri-time-line text-xl text-primary-content"></i>
        </A>

        <div class="divider my-2 w-full px-2"></div>

        {/* Navigation Icons - Icon Only */}
        <nav class="flex flex-col gap-3 flex-1">
          <div class="lg:tooltip lg:tooltip-right" data-tip="Timer">
            <A
              href="/"
              class="btn btn-square"
              activeClass="btn-primary"
              inactiveClass="btn-ghost"
              end
              title="Timer"
            >
              <i class="ri-timer-line text-2xl"></i>
            </A>
          </div>

          <div class="lg:tooltip lg:tooltip-right" data-tip="History">
            <A
              href="/history"
              class="btn btn-square"
              activeClass="btn-primary"
              inactiveClass="btn-ghost"
              title="History"
            >
              <i class="ri-history-line text-2xl"></i>
            </A>
          </div>

          <div class="lg:tooltip lg:tooltip-right" data-tip="Timer Settings">
            <A
              href="/timer-settings"
              class="btn btn-square"
              activeClass="btn-primary"
              inactiveClass="btn-ghost"
              title="Timer Settings"
            >
              <i class="ri-settings-4-line text-2xl"></i>
            </A>
          </div>

          <div class="lg:tooltip lg:tooltip-right" data-tip="Settings">
          <A
            href="/settings"
            class="btn btn-square"
            activeClass="btn-primary"
            inactiveClass="btn-ghost"
            title="Settings"
          >
            <i class="ri-palette-line text-2xl"></i>
          </A>
          </div>
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
      <Route path="/history" component={HistoryPage} />
      <Route path="/timer-settings" component={TimerSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
    </Route>
  );
}

export default App;
