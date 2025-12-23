/**
 * Sound Effects Hook
 * Manages audio playback with SoundPlayer instances
 */

import { onMount } from "solid-js";
import { SoundPlayer } from "../utils/audioUtils";
import clickSound from "../assets/sounds/click1.ogg";
import notificationSound from "../assets/sounds/mixkit-notification-bell-592.wav";
import popAlertSound from "../assets/sounds/mixkit-message-pop-alert-2354.mp3";

export interface SoundEffects {
  playClick: () => void;
  playNotification: () => void;
  playPopAlert: () => void;
  playTestNotification: () => void;
}

/**
 * Custom hook for managing sound effects
 * @param soundEnabled - Whether sound effects are enabled
 */
export function useSoundEffects(soundEnabled: () => boolean): SoundEffects {
  let clickPlayer: SoundPlayer;
  let notificationPlayer: SoundPlayer;
  let popAlertPlayer: SoundPlayer;

  onMount(() => {
    clickPlayer = new SoundPlayer(clickSound, 0.37);
    notificationPlayer = new SoundPlayer(notificationSound, 0.6);
    popAlertPlayer = new SoundPlayer(popAlertSound, 0.27);
  });

  const playClick = () => {
    clickPlayer?.play();
  };

  const playNotification = () => {
    if (soundEnabled()) {
      notificationPlayer?.play();
    }
  };

  const playPopAlert = () => {
    popAlertPlayer?.play();
  };

  const playTestNotification = () => {
    notificationPlayer?.play();
  };

  return {
    playClick,
    playNotification,
    playPopAlert,
    playTestNotification,
  };
}
