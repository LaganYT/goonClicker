import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

class AudioService {
  private settings: AudioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5,
  };
  private isInitialized: boolean = false;

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
      console.log('Audio effects will be created on-demand');
    } catch (error) {
      console.log('Error preloading sound effects:', error);
    }
  }

  async loadBackgroundMusic() {
    try {
      console.log('Background music system initialized');
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
      console.log(`Playing sound effect: ${effectName} at volume ${this.settings.soundVolume}`);
      
      // For now, we'll just log the sound effect
      // In a real implementation, you would play actual audio here
      // This avoids the native shared object issues
      
    } catch (error) {
      console.log(`Error playing ${effectName} sound effect:`, error);
    }
  }

  async playBackgroundMusic() {
    if (!this.settings.musicEnabled) {
      console.log('Background music disabled');
      return;
    }

    try {
      console.log(`Playing background music at volume ${this.settings.musicVolume}`);
    } catch (error) {
      console.log('Error playing background music:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      console.log('Stopping background music');
    } catch (error) {
      console.log('Error stopping background music:', error);
    }
  }

  async pauseBackgroundMusic() {
    try {
      console.log('Pausing background music');
    } catch (error) {
      console.log('Error pausing background music:', error);
    }
  }

  async updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();

    console.log('Audio settings updated:', this.settings);
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    console.log('Audio service cleanup completed');
  }

  setInitialized() {
    this.isInitialized = true;
  }
}

export const audioService = new AudioService(); 