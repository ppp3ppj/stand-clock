/**
 * Protected Link Component
 * Navigation link that shows warning when timer is running
 */

import { Component, JSX, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useSessionTracking } from "../contexts/SessionTrackingContext";

interface ProtectedLinkProps {
  href: string;
  class?: string;
  children: JSX.Element;
}

export const ProtectedLink: Component<ProtectedLinkProps> = (props) => {
  const { isTimerRunning } = useSessionTracking();

  const handleClick = (e: MouseEvent) => {
    if (isTimerRunning() && props.href !== "/") {
      const confirmLeave = confirm(
        "Timer is currently running. Leaving this page will pause the timer. Do you want to continue?"
      );
      
      if (!confirmLeave) {
        e.preventDefault();
      }
    }
  };

  return (
    <Show
      when={!isTimerRunning() || props.href === "/"}
      fallback={
        <A
          href={props.href}
          class={`${props.class || ""} ${isTimerRunning() && props.href !== "/" ? "opacity-60" : ""}`}
          onClick={handleClick}
        >
          {props.children}
        </A>
      }
    >
      <A href={props.href} class={props.class}>
        {props.children}
      </A>
    </Show>
  );
};
