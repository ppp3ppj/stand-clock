import { Route, A } from "@solidjs/router";
import { ParentComponent } from "solid-js";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

const Layout: ParentComponent = (props) => {
  return (
    <>
      <nav class="navbar bg-base-100 shadow-lg mb-4">
        <div class="flex-1">
          <A href="/" class="btn btn-ghost text-xl">Stand Clock</A>
        </div>
        <div class="flex-none">
          <A href="/settings" class="btn btn-ghost">
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
      <Route path="/settings" component={SettingsPage} />
    </Route>
  );
}

export default App;
