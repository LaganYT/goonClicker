import { Achievement, GameState } from '../types/GameTypes';

export const ACHIEVEMENTS: Achievement[] = [
  // Clicking Achievements
  {
    id: 'first_click',
    name: 'First Click',
    description: 'Click the goon button for the first time',
    condition: (state: GameState) => state.totalClicks >= 1,
    unlocked: false,
    icon: 'hand-left-outline',
    reward: 10,
    category: 'clicking'
  },
  {
    id: 'click_master',
    name: 'Click Master',
    description: 'Click 100 times',
    condition: (state: GameState) => state.totalClicks >= 100,
    unlocked: false,
    icon: 'hand-left-outline',
    reward: 50,
    category: 'clicking'
  },
  {
    id: 'click_legend',
    name: 'Click Legend',
    description: 'Click 1,000 times',
    condition: (state: GameState) => state.totalClicks >= 1000,
    unlocked: false,
    icon: 'hand-left-outline',
    reward: 200,
    category: 'clicking'
  },
  {
    id: 'click_god',
    name: 'Click God',
    description: 'Click 10,000 times',
    condition: (state: GameState) => state.totalClicks >= 10000,
    unlocked: false,
    icon: 'hand-left-outline',
    reward: 1000,
    category: 'clicking'
  },

  // Production Achievements
  {
    id: 'first_goon',
    name: 'First Goon',
    description: 'Earn your first goon',
    condition: (state: GameState) => state.totalGoonsEarned >= 1,
    unlocked: false,
    icon: 'diamond-outline',
    reward: 5,
    category: 'production'
  },
  {
    id: 'goon_collector',
    name: 'Goon Collector',
    description: 'Earn 1,000 goons total',
    condition: (state: GameState) => state.totalGoonsEarned >= 1000,
    unlocked: false,
    icon: 'diamond-outline',
    reward: 100,
    category: 'production'
  },
  {
    id: 'goon_millionaire',
    name: 'Goon Millionaire',
    description: 'Earn 1,000,000 goons total',
    condition: (state: GameState) => state.totalGoonsEarned >= 1000000,
    unlocked: false,
    icon: 'diamond-outline',
    reward: 5000,
    category: 'production'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Generate 100 goons per second',
    condition: (state: GameState) => state.goonsPerSecond >= 100,
    unlocked: false,
    icon: 'speedometer-outline',
    reward: 500,
    category: 'production'
  },

  // Upgrade Achievements
  {
    id: 'first_upgrade',
    name: 'First Upgrade',
    description: 'Buy your first upgrade',
    condition: (state: GameState) => 
      Object.values(state.upgrades).some(upgrade => upgrade.level > 0),
    unlocked: false,
    icon: 'trending-up',
    reward: 25,
    category: 'upgrades'
  },
  {
    id: 'upgrade_master',
    name: 'Upgrade Master',
    description: 'Reach level 10 on any upgrade',
    condition: (state: GameState) => 
      Object.values(state.upgrades).some(upgrade => upgrade.level >= 10),
    unlocked: false,
    icon: 'trending-up',
    reward: 250,
    category: 'upgrades'
  },
  {
    id: 'all_upgrades',
    name: 'All Upgrades',
    description: 'Buy all upgrade types',
    condition: (state: GameState) => 
      Object.values(state.upgrades).every(upgrade => upgrade.level > 0),
    unlocked: false,
    icon: 'trending-up',
    reward: 1000,
    category: 'upgrades'
  },

  // Prestige Achievements
  {
    id: 'first_prestige',
    name: 'First Prestige',
    description: 'Perform your first prestige',
    condition: (state: GameState) => state.prestige.totalPrestige >= 1,
    unlocked: false,
    icon: 'refresh',
    reward: 5000,
    category: 'prestige'
  },
  {
    id: 'prestige_master',
    name: 'Prestige Master',
    description: 'Reach prestige level 10',
    condition: (state: GameState) => state.prestige.level >= 10,
    unlocked: false,
    icon: 'refresh',
    reward: 25000,
    category: 'prestige'
  },

  // Special Achievements
  {
    id: 'daily_streak',
    name: 'Daily Streak',
    description: 'Claim daily rewards for 7 days in a row',
    condition: (state: GameState) => {
      const claimedDays = state.dailyRewards.filter(reward => reward.claimed).length;
      return claimedDays >= 7;
    },
    unlocked: false,
    icon: 'calendar',
    reward: 1000,
    category: 'special'
  },
  {
    id: 'event_participant',
    name: 'Event Participant',
    description: 'Participate in a special event',
    condition: (state: GameState) => 
      state.specialEvents.some(event => event.active),
    unlocked: false,
    icon: 'star',
    reward: 500,
    category: 'special'
  }
];

export const getUnlockedAchievements = (gameState: GameState): Achievement[] => {
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: achievement.condition(gameState)
  }));
};

export const getNewAchievements = (gameState: GameState): Achievement[] => {
  return getUnlockedAchievements(gameState).filter(achievement => 
    !gameState.achievements.find(a => a.id === achievement.id)?.unlocked
  );
}; 