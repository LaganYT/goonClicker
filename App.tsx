import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

import GameScreen from './src/screens/GameScreen';
import ShopScreen from './src/screens/ShopScreen';
import StatsScreen from './src/screens/StatsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import DailyRewardsScreen from './src/screens/DailyRewardsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { GameContext } from './src/context/GameContext';
import { GameState } from './src/types/GameTypes';
import { ACHIEVEMENTS, getUnlockedAchievements, getNewAchievements } from './src/data/achievements';
import { generateDailyRewards, getCurrentDay, canClaimDailyReward } from './src/data/dailyRewards';
import { SPECIAL_EVENTS, updateEventStatus, getEventMultiplier } from './src/data/specialEvents';
import { audioService } from './src/services/AudioService';
import { statisticsService } from './src/services/StatisticsService';
import { notificationService } from './src/services/NotificationService';

const Stack = createStackNavigator();

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    goons: 0,
    goonsPerSecond: 0,
    goonsPerClick: 1,
    totalGoonsEarned: 0,
    totalClicks: 0,
    upgrades: {
      clickPower: { level: 0, cost: 10, multiplier: 1 },
      autoClicker: { level: 0, cost: 50, multiplier: 1 },
      goonFactory: { level: 0, cost: 200, multiplier: 5 },
      goonMine: { level: 0, cost: 1000, multiplier: 20 },
      goonBank: { level: 0, cost: 5000, multiplier: 100 },
      goonTemple: { level: 0, cost: 25000, multiplier: 500 },
      goonLab: { level: 0, cost: 100000, multiplier: 2000 },
      goonPortal: { level: 0, cost: 500000, multiplier: 10000 },
    },
    achievements: [],
    dailyRewards: generateDailyRewards(),
    specialEvents: SPECIAL_EVENTS,
    prestige: {
      level: 0,
      totalPrestige: 0,
      multiplier: 1,
      goonsRequired: 1000000,
    },
    lastSaveTime: Date.now(),
    lastDailyReward: 0,
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5,
    vibrationEnabled: true,
    theme: 'dark',
    autoSaveEnabled: true,
    notificationsEnabled: true,
    particleEffectsEnabled: true,
  });

  // Load game state from storage and initialize audio
  useEffect(() => {
    loadGameState();
    initializeAudio();
    statisticsService.startSession();
    
    return () => {
      audioService.cleanup();
      statisticsService.endSession();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      console.log('Initializing audio system...');
      
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Audio permission not granted');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await audioService.preloadSoundEffects();
      await audioService.loadBackgroundMusic();
      audioService.setInitialized();
      
      // Start background music if enabled
      if (gameState.musicEnabled) {
        await audioService.playBackgroundMusic();
      }
      
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.log('Error initializing audio:', error);
    }
  };

  // Save game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveGameState();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [gameState]);

  // Function to recalculate goons per click based on current upgrades and prestige
  const recalculateGoonsPerClick = () => {
    const baseClickPower = 1;
    const clickPowerBonus = gameState.upgrades.clickPower.level * 1; // baseMultiplier is 1
    const totalClickPower = baseClickPower + clickPowerBonus;
    const correctGoonsPerClick = Math.floor(totalClickPower * gameState.prestige.multiplier);
    
    if (correctGoonsPerClick !== gameState.goonsPerClick) {
      updateGameState({ goonsPerClick: correctGoonsPerClick });
    }
  };

  // Recalculate goons per click when upgrades or prestige changes
  useEffect(() => {
    recalculateGoonsPerClick();
  }, [gameState.upgrades.clickPower.level, gameState.prestige.multiplier]);

  const loadGameState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('goonClickerState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Calculate offline progress
        const now = Date.now();
        const timeDiff = now - parsedState.lastSaveTime;
        const offlineGoons = parsedState.goonsPerSecond * (timeDiff / 1000);
        
        // Recalculate goons per click properly
        const baseClickPower = 1;
        const clickPowerBonus = parsedState.upgrades.clickPower.level * 1; // baseMultiplier is 1
        const totalClickPower = baseClickPower + clickPowerBonus;
        const correctGoonsPerClick = Math.floor(totalClickPower * parsedState.prestige.multiplier);
        
        setGameState({
          ...parsedState,
          goons: parsedState.goons + offlineGoons,
          goonsPerClick: correctGoonsPerClick,
          lastSaveTime: now,
        });
      }
    } catch (error) {
      console.log('Error loading game state:', error);
    }
  };

  const saveGameState = async () => {
    try {
      await AsyncStorage.setItem('goonClickerState', JSON.stringify({
        ...gameState,
        lastSaveTime: Date.now(),
      }));
    } catch (error) {
      console.log('Error saving game state:', error);
    }
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const claimDailyReward = (day: number) => {
    const currentDay = getCurrentDay(gameState.lastDailyReward);
    if (currentDay === day) {
      const reward = gameState.dailyRewards.find(r => r.day === day);
      if (reward && !reward.claimed) {
        // Play reward sound effect
        audioService.playSoundEffect('reward');
        
        const newDailyRewards = gameState.dailyRewards.map(r => 
          r.day === day ? { ...r, claimed: true } : r
        );
        
        updateGameState({
          goons: gameState.goons + reward.reward + reward.bonus,
          dailyRewards: newDailyRewards,
          lastDailyReward: Date.now(),
        });
        statisticsService.recordDailyReward();
        notificationService.notifyDailyReward(day, reward.reward + reward.bonus);
      }
    }
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (
      achievement &&
      !gameState.achievements.some(a => a.id === achievementId)
    ) {
      // Play achievement sound effect
      audioService.playSoundEffect('achievement');
      
      updateGameState({
        achievements: [...gameState.achievements, achievement],
      });
      statisticsService.recordAchievement();
      notificationService.notifyAchievement(achievement.name, achievement.reward);
    }
  };

  const performPrestige = () => {
    if (gameState.goons >= gameState.prestige.goonsRequired) {
      // Play prestige sound effect
      audioService.playSoundEffect('prestige');
      
      const newPrestigeLevel = gameState.prestige.level + 1;
      const newMultiplier = gameState.prestige.multiplier + 0.5;
      const newGoonsRequired = gameState.prestige.goonsRequired * 10;
      
      updateGameState({
        goons: 0,
        goonsPerSecond: 0,
        goonsPerClick: 1,
        totalGoonsEarned: 0,
        totalClicks: 0,
        upgrades: {
          clickPower: { level: 0, cost: 10, multiplier: 1 },
          autoClicker: { level: 0, cost: 50, multiplier: 1 },
          goonFactory: { level: 0, cost: 200, multiplier: 5 },
          goonMine: { level: 0, cost: 1000, multiplier: 20 },
          goonBank: { level: 0, cost: 5000, multiplier: 100 },
          goonTemple: { level: 0, cost: 25000, multiplier: 500 },
          goonLab: { level: 0, cost: 100000, multiplier: 2000 },
          goonPortal: { level: 0, cost: 500000, multiplier: 10000 },
        },
        prestige: {
          level: newPrestigeLevel,
          totalPrestige: gameState.prestige.totalPrestige + 1,
          multiplier: newMultiplier,
          goonsRequired: newGoonsRequired,
        },
      });
      statisticsService.recordPrestige();
      notificationService.notifyPrestige(newPrestigeLevel, newMultiplier);
    }
  };

  const toggleSound = () => {
    const newSoundEnabled = !gameState.soundEnabled;
    console.log('App: Toggling sound from', gameState.soundEnabled, 'to', newSoundEnabled);
    updateGameState({ soundEnabled: newSoundEnabled });
    audioService.updateSettings({ soundEnabled: newSoundEnabled });
  };

  const toggleMusic = () => {
    const newMusicEnabled = !gameState.musicEnabled;
    console.log('App: Toggling music from', gameState.musicEnabled, 'to', newMusicEnabled);
    updateGameState({ musicEnabled: newMusicEnabled });
    audioService.updateSettings({ musicEnabled: newMusicEnabled });
    
    if (newMusicEnabled) {
      audioService.playBackgroundMusic();
    } else {
      audioService.pauseBackgroundMusic();
    }
  };

  const setSoundVolume = (volume: number) => {
    console.log('App: Setting sound volume to', volume);
    updateGameState({ soundVolume: volume });
    audioService.updateSettings({ soundVolume: volume });
  };

  const setMusicVolume = (volume: number) => {
    console.log('App: Setting music volume to', volume);
    updateGameState({ musicVolume: volume });
    audioService.updateSettings({ musicVolume: volume });
  };

  const toggleVibration = () => {
    updateGameState({ vibrationEnabled: !gameState.vibrationEnabled });
  };

  const toggleAutoSave = () => {
    updateGameState({ autoSaveEnabled: !gameState.autoSaveEnabled });
  };

  const toggleNotifications = () => {
    const newNotificationsEnabled = !gameState.notificationsEnabled;
    updateGameState({ notificationsEnabled: newNotificationsEnabled });
    notificationService.setEnabled(newNotificationsEnabled);
  };

  const toggleParticleEffects = () => {
    updateGameState({ particleEffectsEnabled: !gameState.particleEffectsEnabled });
  };

  const changeTheme = (theme: 'dark' | 'light' | 'neon') => {
    updateGameState({ theme });
  };

  return (
    <SafeAreaProvider>
      <GameContext.Provider value={{ 
        gameState, 
        updateGameState, 
        claimDailyReward, 
        unlockAchievement, 
        performPrestige,
        toggleSound,
        toggleMusic,
        setSoundVolume,
        setMusicVolume,
        toggleVibration,
        toggleAutoSave,
        toggleNotifications,
        toggleParticleEffects,
        changeTheme
      }}>
        <NavigationContainer>
          <Stack.Navigator
            id={undefined}
            initialRouteName="Game"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a2e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Game" 
              component={GameScreen} 
              options={{ title: 'Goon Clicker' }}
            />
            <Stack.Screen 
              name="Shop" 
              component={ShopScreen} 
              options={{ title: 'Upgrades' }}
            />
            <Stack.Screen 
              name="Stats" 
              component={StatsScreen} 
              options={{ title: 'Statistics' }}
            />
            <Stack.Screen 
              name="Achievements" 
              component={AchievementsScreen} 
              options={{ title: 'Achievements' }}
            />
            <Stack.Screen 
              name="DailyRewards" 
              component={DailyRewardsScreen} 
              options={{ title: 'Daily Rewards' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ title: 'Notifications' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </GameContext.Provider>
    </SafeAreaProvider>
  );
}