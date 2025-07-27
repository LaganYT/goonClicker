import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useGameContext } from '../context/GameContext';
import { getCurrentDay, canClaimDailyReward } from '../data/dailyRewards';

export default function DailyRewardsScreen() {
  const { gameState, claimDailyReward } = useGameContext();
  const currentDay = getCurrentDay(gameState.lastDailyReward);
  const canClaim = canClaimDailyReward(gameState.lastDailyReward);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const handleClaimReward = (day: number) => {
    if (day === currentDay && canClaim) {
      claimDailyReward(day);
      Alert.alert('Reward Claimed!', 'Daily reward has been added to your goons!');
    } else {
      Alert.alert('Cannot Claim', 'This reward is not available yet.');
    }
  };

  const renderRewardItem = (reward: any, index: number) => {
    const isCurrentDay = reward.day === currentDay;
    const isClaimed = reward.claimed;
    const isAvailable = reward.day <= currentDay;
    const isSpecialDay = reward.day % 7 === 0; // Every 7th day is special

    return (
      <View key={reward.day} style={styles.rewardItem}>
        <LinearGradient
          colors={
            isSpecialDay ? ['#f39c12', '#e67e22'] :
            isClaimed ? ['#4CAF50', '#45a049'] :
            isCurrentDay ? ['#4a90e2', '#357abd'] :
            isAvailable ? ['#666', '#444'] :
            ['#333', '#222']
          }
          style={styles.rewardGradient}
        >
          <View style={styles.rewardHeader}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayNumber}>Day {reward.day}</Text>
              {isSpecialDay && (
                <View style={styles.specialBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardAmount}>
                {formatNumber(reward.reward)} Goons
              </Text>
              {reward.bonus > 0 && (
                <Text style={styles.bonusAmount}>
                  +{formatNumber(reward.bonus)} Bonus
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.rewardFooter}>
            {isClaimed ? (
              <View style={styles.claimedContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.claimedText}>Claimed</Text>
              </View>
            ) : isCurrentDay && canClaim ? (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => handleClaimReward(reward.day)}
              >
                <Text style={styles.claimButtonText}>CLAIM NOW</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.statusText}>
                {isAvailable ? 'Available' : 'Coming Soon'}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const claimedCount = gameState.dailyRewards.filter(r => r.claimed).length;
  const totalDays = gameState.dailyRewards.length;

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Rewards</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Claimed</Text>
            <Text style={styles.statValue}>{claimedCount}/{totalDays}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current Day</Text>
            <Text style={styles.statValue}>{currentDay || 'None'}</Text>
          </View>
        </View>
        {canClaim && (
          <View style={styles.claimPrompt}>
            <Ionicons name="gift" size={20} color="#4CAF50" />
            <Text style={styles.claimPromptText}>
              You have a reward ready to claim!
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.rewardsContainer}>
          {gameState.dailyRewards.map(renderRewardItem)}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  claimPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    padding: 10,
    borderRadius: 10,
  },
  claimPromptText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  rewardsContainer: {
    padding: 20,
  },
  rewardItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  rewardGradient: {
    padding: 20,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  specialBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bonusAmount: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  rewardFooter: {
    alignItems: 'center',
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#ccc',
    fontSize: 14,
  },
}); 