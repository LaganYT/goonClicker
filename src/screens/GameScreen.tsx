import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
// import { Haptics } from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useGameContext } from '../context/GameContext';
import { useTheme } from '../hooks/useTheme';
import { GameState } from '../types/GameTypes';
import { getNewAchievements } from '../data/achievements';
import { audioService } from '../services/AudioService';
import { statisticsService } from '../services/StatisticsService';
import { notificationService } from '../services/NotificationService';
import ParticleSystem from '../components/ParticleSystem';

const { width, height } = Dimensions.get('window');

export default function GameScreen() {
  const navigation = useNavigation();
  const { gameState, updateGameState, unlockAchievement } = useGameContext();
  const { colors } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [floatingTexts, setFloatingTexts] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    opacity: Animated.Value;
  }>>([]);
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const floatingTextCounter = useRef(0);

  useEffect(() => {
    const updateNotificationCount = () => {
      setNotificationCount(notificationService.getUnreadCount());
    };
    
    updateNotificationCount();
    const interval = setInterval(updateNotificationCount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-clicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.goonsPerSecond > 0) {
        updateGameState({
          goons: gameState.goons + gameState.goonsPerSecond,
          totalGoonsEarned: gameState.totalGoonsEarned + gameState.goonsPerSecond,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.goonsPerSecond]);

  const handleGoonClick = () => {
    // Play click sound effect
    audioService.playSoundEffect('click');

    // Trigger particle effects
    setParticleTrigger(true);

    // Haptic feedback - disabled for compatibility
    // try {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // } catch (error) {
    //   // Haptics not available on this platform
    // }

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Update game state
    const newGoons = gameState.goons + gameState.goonsPerClick;
    const newTotalGoonsEarned = gameState.totalGoonsEarned + gameState.goonsPerClick;
    const newTotalClicks = gameState.totalClicks + 1;

    updateGameState({
      goons: newGoons,
      totalGoonsEarned: newTotalGoonsEarned,
      totalClicks: newTotalClicks,
    });

    // Create floating text
    const floatingText = {
      id: `floating-${floatingTextCounter.current++}`,
      text: `+${gameState.goonsPerClick}`,
      x: Math.random() * (width - 100) + 50,
      y: height * 0.4,
      opacity: new Animated.Value(1),
    };

    setFloatingTexts(prev => [...prev, floatingText]);

    // Animate floating text
    Animated.sequence([
      Animated.timing(floatingText.opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== floatingText.id));
    });

    // Check for achievements
    const newAchievements = getNewAchievements(gameState);
    newAchievements.forEach(achievement => {
      unlockAchievement(achievement.id);
    });

    // Update statistics
    statisticsService.recordClick();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const getGradientColors = (): [string, string, string] => {
    switch (gameState.theme) {
      case 'light':
        return ['#ffffff', '#f5f5f5', '#e0e0e0'];
      case 'neon':
        return ['#0a0a0a', '#1a1a2e', '#16213e'];
      default:
        return ['#0f0f23', '#1a1a2e', '#16213e'];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.goonCount, { color: colors.text }]}>
            {formatNumber(gameState.goons)} Goons
          </Text>
          <Text style={[styles.goonPerSecond, { color: colors.textSecondary }]}>
            {formatNumber(gameState.goonsPerSecond)}/s
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications" size={24} color={colors.text} />
            {notificationCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.notificationBadgeText, { color: colors.text }]}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        {/* Floating Text */}
        {floatingTexts.map(text => (
          <Animated.Text
            key={text.id}
            style={[
              styles.floatingText,
              {
                left: text.x,
                top: text.y,
                opacity: text.opacity,
                color: colors.accent,
              },
            ]}
          >
            {text.text}
          </Animated.Text>
        ))}

        {/* Particle System */}
        {gameState.particleEffectsEnabled && (
          <ParticleSystem
            enabled={gameState.particleEffectsEnabled}
            trigger={particleTrigger}
            onTriggerComplete={() => setParticleTrigger(false)}
          />
        )}
        {/* Main Click Button */}
        <Animated.View style={[styles.clickButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[styles.clickButton, { backgroundColor: colors.accent }]}
            onPress={handleGoonClick}
            activeOpacity={0.8}
          >
            <Text style={[styles.clickButtonText, { color: colors.text }]}>
              Click for {formatNumber(gameState.goonsPerClick)} Goons
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            Total Clicks: {formatNumber(gameState.totalClicks)}
          </Text>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            Total Earned: {formatNumber(gameState.totalGoonsEarned)}
          </Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Shop' as never)}
        >
          <Ionicons name="cart" size={24} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Stats' as never)}
        >
          <Ionicons name="stats-chart" size={24} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Achievements' as never)}
        >
          <Ionicons name="trophy" size={24} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Achievements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('DailyRewards' as never)}
        >
          <Ionicons name="gift" size={24} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>Rewards</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  goonCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  goonPerSecond: {
    fontSize: 14,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 1000,
  },
  clickButtonContainer: {
    alignItems: 'center',
  },
  clickButton: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  clickButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 