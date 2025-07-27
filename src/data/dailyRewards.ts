import { DailyReward } from '../types/GameTypes';

export const generateDailyRewards = (): DailyReward[] => {
  const rewards: DailyReward[] = [];
  
  for (let day = 1; day <= 30; day++) {
    const baseReward = Math.floor(10 * Math.pow(1.5, day - 1));
    const bonus = Math.floor(baseReward * 0.1 * Math.floor(day / 7)); // Bonus every 7 days
    
    rewards.push({
      day,
      claimed: false,
      reward: baseReward,
      bonus: bonus
    });
  }
  
  return rewards;
};

export const getCurrentDay = (lastDailyReward: number): number => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  if (lastDailyReward === 0) {
    return 1;
  }
  
  const daysSinceLastReward = Math.floor((now - lastDailyReward) / oneDay);
  
  if (daysSinceLastReward >= 1) {
    return Math.min(30, daysSinceLastReward + 1);
  }
  
  return 0; // No new day available
};

export const canClaimDailyReward = (lastDailyReward: number): boolean => {
  return getCurrentDay(lastDailyReward) > 0;
}; 