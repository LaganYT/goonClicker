import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useGameContext } from '../context/GameContext';
import { getActiveEvents } from '../data/specialEvents';
import { statisticsService } from '../services/StatisticsService';

export default function StatsScreen() {
  const { gameState } = useGameContext();
  const stats = statisticsService.getStats();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View key={title} style={styles.statCard}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color="#fff" />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </LinearGradient>
    </View>
  );

  const renderUpgradeStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upgrade Levels</Text>
      <View style={styles.upgradeStatsContainer}>
        {Object.entries(gameState.upgrades).map(([key, upgrade]) => (
          <View key={key} style={styles.upgradeStat}>
            <Text style={styles.upgradeName}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
            <Text style={styles.upgradeLevel}>Level {upgrade.level}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Main Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Statistics</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Total Goons',
                formatNumber(gameState.totalGoonsEarned),
                'diamond-outline',
                '#ff6b6b'
              )}
              {renderStatCard(
                'Current Goons',
                formatNumber(gameState.goons),
                'wallet',
                '#4a90e2'
              )}
              {renderStatCard(
                'Total Clicks',
                formatNumber(gameState.totalClicks),
                'hand-left-outline',
                '#50c878'
              )}
              {renderStatCard(
                'Goons/Second',
                formatNumber(gameState.goonsPerSecond),
                'speedometer-outline',
                '#ffa500'
              )}
              {renderStatCard(
                'Goons/Click',
                formatNumber(gameState.goonsPerClick),
                'flash-outline',
                '#9b59b6'
              )}
              {renderStatCard(
                'Play Time',
                statisticsService.formatPlayTime(stats.totalPlayTime),
                'time-outline',
                '#e74c3c'
              )}
              {renderStatCard(
                'Sessions',
                stats.sessionsPlayed.toString(),
                'game-controller-outline',
                '#f39c12'
              )}
              {renderStatCard(
                'Upgrades',
                stats.totalUpgradesPurchased.toString(),
                'trending-up-outline',
                '#27ae60'
              )}
            </View>
          </View>

          {/* Performance Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceContainer}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Click Rate</Text>
                <Text style={styles.performanceValue}>
                  {stats.averageClicksPerMinute.toFixed(1)} clicks/min
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Efficiency</Text>
                <Text style={styles.performanceValue}>
                  {stats.clickEfficiency > 0 
                    ? (stats.clickEfficiency * 100).toFixed(1)
                    : '0'}%
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Fastest Prestige</Text>
                <Text style={styles.performanceValue}>
                  {stats.fastestPrestige > 0 
                    ? statisticsService.formatTime(stats.fastestPrestige)
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Daily Rewards</Text>
                <Text style={styles.performanceValue}>
                  {stats.totalDailyRewards}
                </Text>
              </View>
            </View>
          </View>

          {/* Upgrade Stats */}
          {renderUpgradeStats()}

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsContainer}>
              <View style={styles.achievementStat}>
                <Text style={styles.achievementStatLabel}>Unlocked</Text>
                <Text style={styles.achievementStatValue}>
                  {gameState.achievements.length}/15
                </Text>
              </View>
              <View style={styles.achievementStat}>
                <Text style={styles.achievementStatLabel}>Completion</Text>
                <Text style={styles.achievementStatValue}>
                  {Math.round((gameState.achievements.length / 15) * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Special Events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Events</Text>
            <View style={styles.eventsContainer}>
              {getActiveEvents(gameState.specialEvents).length > 0 ? (
                getActiveEvents(gameState.specialEvents).map(event => (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.eventsPlaceholder}>
                  No active events at the moment
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  performanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  performanceLabel: {
    color: '#ccc',
    fontSize: 16,
  },
  performanceValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeStatsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  upgradeStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  upgradeName: {
    color: '#ccc',
    fontSize: 14,
  },
  upgradeLevel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
  },
  achievementsPlaceholder: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  achievementStat: {
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementStatLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  achievementStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  eventItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    color: '#ccc',
    fontSize: 14,
  },
  eventsPlaceholder: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
}); 