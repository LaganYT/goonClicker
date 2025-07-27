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
import { getUnlockedAchievements } from '../data/achievements';

export default function AchievementsScreen() {
  const { gameState } = useGameContext();
  const achievements = getUnlockedAchievements(gameState);

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'clicking': return '#ff6b6b';
      case 'production': return '#4a90e2';
      case 'upgrades': return '#50c878';
      case 'prestige': return '#9b59b6';
      case 'special': return '#f39c12';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'clicking': return 'hand-left';
      case 'production': return 'diamond';
      case 'upgrades': return 'trending-up';
      case 'prestige': return 'refresh';
      case 'special': return 'star';
      default: return 'trophy';
    }
  };

  const renderAchievement = (achievement: any) => (
    <View key={achievement.id} style={styles.achievementItem}>
      <LinearGradient
        colors={achievement.unlocked ? 
          [getCategoryColor(achievement.category), getCategoryColor(achievement.category) + '80'] :
          ['#666', '#444']
        }
        style={styles.achievementGradient}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIconContainer}>
            <Ionicons 
              name={achievement.icon as any} 
              size={24} 
              color={achievement.unlocked ? '#fff' : '#888'} 
            />
            {achievement.unlocked && (
              <View style={styles.unlockBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementName,
              !achievement.unlocked && styles.achievementNameLocked
            ]}>
              {achievement.name}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !achievement.unlocked && styles.achievementDescriptionLocked
            ]}>
              {achievement.description}
            </Text>
            <View style={styles.achievementMeta}>
              <View style={styles.categoryTag}>
                <Ionicons 
                  name={getCategoryIcon(achievement.category) as any} 
                  size={12} 
                  color={achievement.unlocked ? '#fff' : '#888'} 
                />
                <Text style={[
                  styles.categoryText,
                  !achievement.unlocked && styles.categoryTextLocked
                ]}>
                  {achievement.category}
                </Text>
              </View>
              <Text style={[
                styles.rewardText,
                !achievement.unlocked && styles.rewardTextLocked
              ]}>
                +{achievement.reward} Goons
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {unlockedCount}/{totalCount}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(unlockedCount / totalCount) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.achievementsContainer}>
          {achievements.map(renderAchievement)}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  achievementsContainer: {
    padding: 20,
  },
  achievementItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  achievementGradient: {
    padding: 20,
  },
  achievementHeader: {
    flexDirection: 'row',
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  unlockBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#888',
  },
  achievementDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: '#666',
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  categoryTextLocked: {
    color: '#888',
  },
  rewardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rewardTextLocked: {
    color: '#888',
  },
}); 