import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameStatistics {
  totalPlayTime: number;
  totalClicks: number;
  totalGoonsEarned: number;
  totalUpgradesPurchased: number;
  totalPrestiges: number;
  totalAchievements: number;
  fastestPrestige: number;
  highestGoonsPerSecond: number;
  highestGoonsPerClick: number;
  totalDailyRewards: number;
  totalSpecialEvents: number;
  clickEfficiency: number;
  averageClicksPerMinute: number;
  lastSessionStart: number;
  sessionsPlayed: number;
}

class StatisticsService {
  private stats: GameStatistics = {
    totalPlayTime: 0,
    totalClicks: 0,
    totalGoonsEarned: 0,
    totalUpgradesPurchased: 0,
    totalPrestiges: 0,
    totalAchievements: 0,
    fastestPrestige: 0,
    highestGoonsPerSecond: 0,
    highestGoonsPerClick: 0,
    totalDailyRewards: 0,
    totalSpecialEvents: 0,
    clickEfficiency: 0,
    averageClicksPerMinute: 0,
    lastSessionStart: Date.now(),
    sessionsPlayed: 0,
  };

  constructor() {
    this.loadStats();
  }

  private async loadStats() {
    try {
      const savedStats = await AsyncStorage.getItem('gameStatistics');
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (error) {
      console.log('Error loading statistics:', error);
    }
  }

  private async saveStats() {
    try {
      await AsyncStorage.setItem('gameStatistics', JSON.stringify(this.stats));
    } catch (error) {
      console.log('Error saving statistics:', error);
    }
  }

  startSession() {
    this.stats.lastSessionStart = Date.now();
    this.stats.sessionsPlayed += 1;
    this.saveStats();
  }

  endSession() {
    const sessionTime = Date.now() - this.stats.lastSessionStart;
    this.stats.totalPlayTime += sessionTime;
    this.saveStats();
  }

  recordClick() {
    this.stats.totalClicks += 1;
    this.updateClickEfficiency();
    this.saveStats();
  }

  recordGoonsEarned(amount: number) {
    this.stats.totalGoonsEarned += amount;
    this.saveStats();
  }

  recordUpgradePurchase() {
    this.stats.totalUpgradesPurchased += 1;
    this.saveStats();
  }

  recordPrestige(timeToPrestige?: number) {
    this.stats.totalPrestiges += 1;
    if (timeToPrestige && (this.stats.fastestPrestige === 0 || timeToPrestige < this.stats.fastestPrestige)) {
      this.stats.fastestPrestige = timeToPrestige;
    }
    this.saveStats();
  }

  recordAchievement() {
    this.stats.totalAchievements += 1;
    this.saveStats();
  }

  recordDailyReward() {
    this.stats.totalDailyRewards += 1;
    this.saveStats();
  }

  recordSpecialEvent() {
    this.stats.totalSpecialEvents += 1;
    this.saveStats();
  }

  updateHighestStats(goonsPerSecond: number, goonsPerClick: number) {
    if (goonsPerSecond > this.stats.highestGoonsPerSecond) {
      this.stats.highestGoonsPerSecond = goonsPerSecond;
    }
    if (goonsPerClick > this.stats.highestGoonsPerClick) {
      this.stats.highestGoonsPerClick = goonsPerClick;
    }
    this.saveStats();
  }

  private updateClickEfficiency() {
    if (this.stats.totalPlayTime > 0) {
      const clicksPerMinute = (this.stats.totalClicks / (this.stats.totalPlayTime / 60000));
      this.stats.averageClicksPerMinute = clicksPerMinute;
      this.stats.clickEfficiency = (this.stats.totalGoonsEarned / this.stats.totalClicks) || 0;
    }
  }

  getStats(): GameStatistics {
    return { ...this.stats };
  }

  formatPlayTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  resetStats() {
    this.stats = {
      totalPlayTime: 0,
      totalClicks: 0,
      totalGoonsEarned: 0,
      totalUpgradesPurchased: 0,
      totalPrestiges: 0,
      totalAchievements: 0,
      fastestPrestige: 0,
      highestGoonsPerSecond: 0,
      highestGoonsPerClick: 0,
      totalDailyRewards: 0,
      totalSpecialEvents: 0,
      clickEfficiency: 0,
      averageClicksPerMinute: 0,
      lastSessionStart: Date.now(),
      sessionsPlayed: 0,
    };
    this.saveStats();
  }
}

export const statisticsService = new StatisticsService(); 