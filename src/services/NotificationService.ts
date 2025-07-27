import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'upgrade' | 'prestige' | 'daily_reward' | 'special_event' | 'info';
  timestamp: number;
  read: boolean;
  action?: string;
  data?: any;
}

class NotificationService {
  private notifications: Notification[] = [];
  private enabled: boolean = true;
  private notificationCounter: number = 0;

  constructor() {
    this.loadNotifications();
  }

  private async loadNotifications() {
    try {
      const savedNotifications = await AsyncStorage.getItem('gameNotifications');
      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications);
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem('gameNotifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.log('Error saving notifications:', error);
    }
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    if (!this.enabled) return;

    // Add a small delay to prevent duplicate timestamps
    await new Promise(resolve => setTimeout(resolve, 1));

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${this.notificationCounter++}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    
    // Keep only the last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    await this.saveNotifications();
  }

  async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
    }
  }

  async markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    await this.saveNotifications();
  }

  async deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
  }

  async clearAllNotifications() {
    this.notifications = [];
    await this.saveNotifications();
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Convenience methods for common notification types
  async notifyAchievement(achievementName: string, reward: number) {
    await this.addNotification({
      title: 'Achievement Unlocked!',
      message: `You've unlocked "${achievementName}" and earned ${reward} goons!`,
      type: 'achievement',
      action: 'view_achievements',
    });
  }

  async notifyUpgrade(upgradeName: string, level: number) {
    await this.addNotification({
      title: 'Upgrade Purchased!',
      message: `${upgradeName} upgraded to level ${level}!`,
      type: 'upgrade',
      action: 'view_shop',
    });
  }

  async notifyPrestige(level: number, multiplier: number) {
    await this.addNotification({
      title: 'Prestige Complete!',
      message: `Prestige level ${level} achieved! You now have a ${multiplier}x multiplier!`,
      type: 'prestige',
      action: 'view_settings',
    });
  }

  async notifyDailyReward(day: number, reward: number) {
    await this.addNotification({
      title: 'Daily Reward Available!',
      message: `Day ${day} reward is ready! Claim ${reward} goons!`,
      type: 'daily_reward',
      action: 'view_daily_rewards',
    });
  }

  async notifySpecialEvent(eventName: string, description: string) {
    await this.addNotification({
      title: 'Special Event!',
      message: `${eventName}: ${description}`,
      type: 'special_event',
      action: 'view_events',
    });
  }

  async notifyInfo(title: string, message: string) {
    await this.addNotification({
      title,
      message,
      type: 'info',
    });
  }
}

export const notificationService = new NotificationService(); 