import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GameScreen from './src/screens/GameScreen';
import ShopScreen from './src/screens/ShopScreen';
import StatsScreen from './src/screens/StatsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import DailyRewardsScreen from './src/screens/DailyRewardsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { GameContext } from './src/context/GameContext';
import { GameState } from './src/types/GameTypes';
import { ACHIEVEMENTS, getUnlockedAchievements, getNewAchievements } from './src/data/achievements';
import { generateDailyRewards, getCurrentDay, canClaimDailyReward } from './src/data/dailyRewards';
import { SPECIAL_EVENTS, updateEventStatus, getEventMultiplier } from './src/data/specialEvents';

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
    vibrationEnabled: true,
    theme: 'dark',
  });

  // Load game state from storage
  useEffect(() => {
    loadGameState();
  }, []);

  // Save game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveGameState();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [gameState]);

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
        const newDailyRewards = gameState.dailyRewards.map(r => 
          r.day === day ? { ...r, claimed: true } : r
        );
        
        updateGameState({
          goons: gameState.goons + reward.reward + reward.bonus,
          dailyRewards: newDailyRewards,
          lastDailyReward: Date.now(),
        });
      }
    }
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement && !gameState.achievements.find(a => a.id === achievementId)?.unlocked) {
      const newAchievements = [...gameState.achievements, { ...achievement, unlocked: true }];
      updateGameState({
        achievements: newAchievements,
        goons: gameState.goons + achievement.reward,
      });
    }
  };

  const performPrestige = () => {
    if (gameState.goons >= gameState.prestige.goonsRequired) {
      const prestigeMultiplier = Math.floor(Math.log10(gameState.goons / gameState.prestige.goonsRequired)) + 1;
      const eventMultiplier = getEventMultiplier(gameState.specialEvents, 'prestige');
      
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
          level: gameState.prestige.level + 1,
          totalPrestige: gameState.prestige.totalPrestige + 1,
          multiplier: gameState.prestige.multiplier + (prestigeMultiplier * eventMultiplier),
          goonsRequired: gameState.prestige.goonsRequired * 10,
        },
      });
    }
  };

  const toggleSound = () => {
    updateGameState({ soundEnabled: !gameState.soundEnabled });
  };

  const toggleVibration = () => {
    updateGameState({ vibrationEnabled: !gameState.vibrationEnabled });
  };

  const changeTheme = (theme: 'dark' | 'light' | 'neon') => {
    updateGameState({ theme });
  };

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

  return (
    <SafeAreaProvider>
      <GameContext.Provider value={{ 
        gameState, 
        updateGameState, 
        claimDailyReward, 
        unlockAchievement, 
        performPrestige,
        toggleSound,
        toggleVibration,
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
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </GameContext.Provider>
    </SafeAreaProvider>
  );
} 