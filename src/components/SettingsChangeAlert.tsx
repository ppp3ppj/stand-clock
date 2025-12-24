import { Component, Show } from "solid-js";

interface SettingsChangeAlertProps {
  hasSettingsChanged: boolean;
}

const SettingsChangeAlert: Component<SettingsChangeAlertProps> = (props) => {
  return (
    <Show when={props.hasSettingsChanged}>
      <div class="alert alert-info">
        <i class="ri-information-line text-xl"></i>
        <div>
          <h3 class="font-bold">Settings Updated</h3>
          <div class="text-sm">
            New settings will apply to your next session
          </div>
        </div>
      </div>
    </Show>
  );
};

export default SettingsChangeAlert;
