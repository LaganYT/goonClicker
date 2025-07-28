export interface Upgrade {
  level: number;
  cost: number;
  multiplier: number;
}

export interface Upgrades {
  clickPower: Upgrade;
  autoClicker: Upgrade;
  goonFactory: Upgrade;
  goonMine: Upgrade;
  goonBank: Upgrade;
  goonTemple: Upgrade;
  goonLab: Upgrade;
  goonPortal: Upgrade;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (gameState: GameState) => boolean;
  unlocked: boolean;
  icon: string;
  reward: number;
  category: 'clicking' | 'production' | 'upgrades' | 'prestige' | 'special';
}

export interface DailyReward {
  day: number;
  claimed: boolean;
  reward: number;
  bonus: number;
}

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  multiplier: number;
  active: boolean;
}

export interface PrestigeData {
  level: number;
  totalPrestige: number;
  multiplier: number;
  goonsRequired: number;
}

export interface GameState {
  goons: number;
  goonsPerSecond: number;
  goonsPerClick: number;
  totalGoonsEarned: number;
  totalClicks: number;
  upgrades: Upgrades;
  achievements: Achievement[];
  dailyRewards: DailyReward[];
  specialEvents: SpecialEvent[];
  prestige: PrestigeData;
  lastSaveTime: number;
  lastDailyReward: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light' | 'neon';
  autoSaveEnabled: boolean;
  notificationsEnabled: boolean;
  particleEffectsEnabled: boolean;
}

export interface GameContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  claimDailyReward: (day: number) => void;
  unlockAchievement: (achievementId: string) => void;
  performPrestige: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  toggleVibration: () => void;
  toggleAutoSave: () => void;
  toggleNotifications: () => void;
  toggleParticleEffects: () => void;
  changeTheme: (theme: 'dark' | 'light' | 'neon') => void;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  shadow: string;
}

export interface Theme {
  name: 'dark' | 'light' | 'neon';
  colors: ThemeColors;
}

export const THEMES: { [key: string]: Theme } = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#4CAF50',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      border: '#333333',
      shadow: '#000000',
    },
  },
  light: {
    name: 'light',
    colors: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      background: '#ffffff',
      surface: '#f9f9f9',
      text: '#333333',
      textSecondary: '#666666',
      accent: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      border: '#e0e0e0',
      shadow: '#000000',
    },
  },
  neon: {
    name: 'neon',
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      background: '#0a0a0a',
      surface: '#1a1a2e',
      text: '#00ff00',
      textSecondary: '#00cc00',
      accent: '#ff00ff',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      border: '#00ff00',
      shadow: '#000000',
    },
  },
}; 