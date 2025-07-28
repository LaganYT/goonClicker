import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

// Static mapping of sound effects to their asset files
const SOUND_EFFECTS = {
  click: require('../../assets/sounds/click.mp3'),
  upgrade: require('../../assets/sounds/upgrade.mp3'),
  achievement: require('../../assets/sounds/achievement.mp3'),
  prestige: require('../../assets/sounds/prestige.mp3'),
  reward: require('../../assets/sounds/reward.mp3'),
  error: require('../../assets/sounds/error.mp3'),
};

class AudioService {
  private settings: AudioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5,
  };
  private isInitialized: boolean = false;
  private soundEffects: { [key: string]: Audio.Sound } = {};
  private backgroundMusic: Audio.Sound | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('audioSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.log('Error loading audio settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.log('Error saving audio settings:', error);
    }
  }

  async preloadSoundEffects() {
    try {
      console.log('Preloading sound effects...');
      
      // Create sound objects for each effect using the static mapping
      for (const [effectName, soundAsset] of Object.entries(SOUND_EFFECTS)) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            soundAsset,
            { shouldPlay: false }
          );
          this.soundEffects[effectName] = sound;
        } catch (error) {
          console.log(`Error loading sound effect ${effectName}:`, error);
        }
      }
      
      console.log('Sound effects preloaded successfully');
    } catch (error) {
      console.log('Error preloading sound effects:', error);
    }
  }

  async loadBackgroundMusic() {
    try {
      console.log('Loading background music...');
      
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/background.mp3'),
        { 
          shouldPlay: false,
          isLooping: true,
          volume: this.settings.musicVolume
        }
      );
      
      this.backgroundMusic = sound;
      console.log('Background music loaded successfully');
    } catch (error) {
      console.log('Error loading background music:', error);
    }
  }

  async playSoundEffect(effectName: string) {
    if (!this.settings.soundEnabled) {
      console.log(`Sound effects disabled, skipping ${effectName}`);
      return;
    }

    try {
      const sound = this.soundEffects[effectName];
      if (sound) {
        await sound.setVolumeAsync(this.settings.soundVolume);
        await sound.replayAsync();
        console.log(`Playing sound effect: ${effectName} at volume ${this.settings.soundVolume}`);
      } else {
        console.log(`Sound effect ${effectName} not found`);
      }
    } catch (error) {
      console.log(`Error playing ${effectName} sound effect:`, error);
    }
  }

  async playBackgroundMusic() {
    if (!this.settings.musicEnabled || !this.backgroundMusic) {
      console.log('Background music disabled or not loaded');
      return;
    }

    try {
      if (!this.isMusicPlaying) {
        await this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
        await this.backgroundMusic.playAsync();
        this.isMusicPlaying = true;
        console.log(`Playing background music at volume ${this.settings.musicVolume}`);
      }
    } catch (error) {
      console.log('Error playing background music:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic && this.isMusicPlaying) {
        await this.backgroundMusic.stopAsync();
        this.isMusicPlaying = false;
        console.log('Stopping background music');
      }
    } catch (error) {
      console.log('Error stopping background music:', error);
    }
  }

  async pauseBackgroundMusic() {
    try {
      if (this.backgroundMusic && this.isMusicPlaying) {
        await this.backgroundMusic.pauseAsync();
        this.isMusicPlaying = false;
        console.log('Pausing background music');
      }
    } catch (error) {
      console.log('Error pausing background music:', error);
    }
  }

  async updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();

    // Update background music volume if it's playing
    if (this.backgroundMusic && this.isMusicPlaying) {
      try {
        await this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
      } catch (error) {
        console.log('Error updating background music volume:', error);
      }
    }

    // Stop music if disabled
    if (!this.settings.musicEnabled && this.isMusicPlaying) {
      await this.pauseBackgroundMusic();
    }

    console.log('Audio settings updated:', this.settings);
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    try {
      // Unload all sound effects
      for (const sound of Object.values(this.soundEffects)) {
        await sound.unloadAsync();
      }
      this.soundEffects = {};

      // Unload background music
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }

      this.isMusicPlaying = false;
      console.log('Audio service cleanup completed');
    } catch (error) {
      console.log('Error during audio cleanup:', error);
    }
  }

  setInitialized() {
    this.isInitialized = true;
  }
}

export const audioService = new AudioService(); 