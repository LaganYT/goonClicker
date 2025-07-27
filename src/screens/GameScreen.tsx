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

    // Record statistics
    statisticsService.recordClick();
    statisticsService.recordGoonsEarned(gameState.goonsPerClick);
    statisticsService.updateHighestStats(gameState.goonsPerSecond, gameState.goonsPerClick);

    // Check for new achievements
    const newAchievements = getNewAchievements({
      ...gameState,
      goons: newGoons,
      totalGoonsEarned: newTotalGoonsEarned,
      totalClicks: newTotalClicks,
    });
    
    newAchievements.forEach(achievement => {
      unlockAchievement(achievement.id);
      audioService.playSoundEffect('achievement');
      statisticsService.recordAchievement();
    });

    // Create floating text
    const newFloatingText = {
      id: `${Date.now()}-${floatingTextCounter.current++}-${Math.random().toString(36).substr(2, 9)}`,
      text: `+${gameState.goonsPerClick}`,
      x: Math.random() * (width - 100) + 50,
      y: height * 0.4,
      opacity: new Animated.Value(1),
    };

    setFloatingTexts(prev => [...prev, newFloatingText]);

    // Animate floating text
    Animated.timing(newFloatingText.opacity, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== newFloatingText.id));
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Goons</Text>
          <Text style={styles.statValue}>{formatNumber(gameState.goons)}</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Per Second</Text>
          <Text style={styles.statValue}>{formatNumber(gameState.goonsPerSecond)}</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={styles.statLabel}>Per Click</Text>
          <Text style={styles.statValue}>{formatNumber(gameState.goonsPerClick)}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications' as never)}
        >
          <Ionicons name="notifications" size={24} color="#fff" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Goon Button */}
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.goonButton}
            onPress={handleGoonClick}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a24', '#ff3838']}
              style={styles.buttonGradient}
            >
              <Text style={styles.goonButtonText}>GOON</Text>
              <Text style={styles.clickHint}>Tap to earn goons!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Floating Text Animations */}
      {floatingTexts.map(text => (
        <Animated.Text
          key={text.id}
          style={[
            styles.floatingText,
            {
              left: text.x,
              top: text.y,
              opacity: text.opacity,
            },
          ]}
        >
          {text.text}
        </Animated.Text>
      ))}

      {/* Particle System */}
      <ParticleSystem
        enabled={gameState.particleEffectsEnabled}
        trigger={particleTrigger}
        onTriggerComplete={() => setParticleTrigger(false)}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Shop' as never)}
        >
          <Ionicons name="storefront-outline" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Shop</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Stats' as never)}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Achievements' as never)}
        >
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Achievements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('DailyRewards' as never)}
        >
          <Ionicons name="gift" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  statContainer: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goonButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goonButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  clickHint: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
  floatingText: {
    position: 'absolute',
    color: '#ff6b6b',
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 1000,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 30,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  navButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 60,
    maxWidth: 80,
    marginHorizontal: 2,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 