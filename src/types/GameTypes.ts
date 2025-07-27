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
  vibrationEnabled: boolean;
  theme: 'dark' | 'light' | 'neon';
}

export interface GameContextType {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  claimDailyReward: (day: number) => void;
  unlockAchievement: (achievementId: string) => void;
  performPrestige: () => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  changeTheme: (theme: 'dark' | 'light' | 'neon') => void;
} 