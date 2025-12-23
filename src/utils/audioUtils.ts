/**
 * Audio Utility Functions
 * Provides reusable audio playback utilities with proper error handling
 */

/**
 * Play an audio file with specified volume
 * @param audioPath - Path to the audio file
 * @param volume - Volume level (0.0 to 1.0)
 * @returns Promise that resolves when audio starts playing
 */
export async function playAudio(audioPath: string, volume: number = 1.0): Promise<void> {
  try {
    const audio = new Audio(audioPath);
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
    await audio.play();
  } catch (error) {
    console.warn(`Failed to play audio: ${audioPath}`, error);
  }
}

/**
 * Audio player class for reusable sound effects
 */
export class SoundPlayer {
  private audio: HTMLAudioElement;
  private defaultVolume: number;

  constructor(audioPath: string, defaultVolume: number = 1.0) {
    this.audio = new Audio(audioPath);
    this.defaultVolume = Math.max(0, Math.min(1, defaultVolume));
    this.audio.volume = this.defaultVolume;
  }

  /**
   * Play the audio with optional custom volume
   * @param volume - Custom volume for this playback (optional)
   */
  async play(volume?: number): Promise<void> {
    try {
      if (volume !== undefined) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
      } else {
        this.audio.volume = this.defaultVolume;
      }
      
      // Reset audio to start if already playing
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch (error) {
      console.warn('Failed to play sound effect', error);
    }
  }

  /**
   * Set the default volume for future playbacks
   * @param volume - New default volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.defaultVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.defaultVolume;
  }

  /**
   * Stop the audio playback
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
