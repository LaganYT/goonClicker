import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { Haptics } from 'expo-haptics';

import { useGameContext } from '../context/GameContext';
import { useTheme } from '../hooks/useTheme';
import { getEventMultiplier } from '../data/specialEvents';
import { audioService } from '../services/AudioService';
import { statisticsService } from '../services/StatisticsService';
import { notificationService } from '../services/NotificationService';

interface UpgradeItem {
  key: keyof typeof upgradeData;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  baseMultiplier: number;
}

const upgradeData: Record<string, UpgradeItem> = {
  clickPower: {
    key: 'clickPower',
    name: 'Click Power',
    description: 'Increase goons per click',
    icon: 'hand-left-outline',
    baseCost: 10,
    baseMultiplier: 1,
  },
  autoClicker: {
    key: 'autoClicker',
    name: 'Auto Clicker',
    description: 'Automatically generates goons per second',
    icon: 'timer',
    baseCost: 50,
    baseMultiplier: 1,
  },
  goonFactory: {
    key: 'goonFactory',
    name: 'Goon Factory',
    description: 'Mass produce goons automatically',
    icon: 'business-outline',
    baseCost: 200,
    baseMultiplier: 5,
  },
  goonMine: {
    key: 'goonMine',
    name: 'Goon Mine',
    description: 'Extract goons from deep underground',
    icon: 'construct-outline',
    baseCost: 1000,
    baseMultiplier: 20,
  },
  goonBank: {
    key: 'goonBank',
    name: 'Goon Bank',
    description: 'Invest goons for massive returns',
    icon: 'card-outline',
    baseCost: 5000,
    baseMultiplier: 100,
  },
  goonTemple: {
    key: 'goonTemple',
    name: 'Goon Temple',
    description: 'Sacred goon production facility',
    icon: 'church-outline',
    baseCost: 25000,
    baseMultiplier: 500,
  },
  goonLab: {
    key: 'goonLab',
    name: 'Goon Lab',
    description: 'Advanced goon research facility',
    icon: 'flask-outline',
    baseCost: 100000,
    baseMultiplier: 2000,
  },
  goonPortal: {
    key: 'goonPortal',
    name: 'Goon Portal',
    description: 'Interdimensional goon gateway',
    icon: 'planet-outline',
    baseCost: 500000,
    baseMultiplier: 10000,
  },
};

export default function ShopScreen() {
  const { gameState, updateGameState } = useGameContext();
  const { colors } = useTheme();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const calculateUpgradeCost = (upgrade: UpgradeItem): number => {
    const currentLevel = gameState.upgrades[upgrade.key].level;
    // Fix: Use correct event type for getEventMultiplier
    const eventMultiplier = getEventMultiplier(gameState.specialEvents, 'upgrades');
    return Math.floor(upgrade.baseCost * Math.pow(1.15, currentLevel) / eventMultiplier);
  };

  const canAffordUpgrade = (upgrade: UpgradeItem): boolean => {
    return gameState.goons >= calculateUpgradeCost(upgrade);
  };

  const purchaseUpgrade = (upgrade: UpgradeItem) => {
    const cost = calculateUpgradeCost(upgrade);
    
    if (gameState.goons >= cost) {
      // Play upgrade sound effect
      audioService.playSoundEffect('upgrade');

      const currentLevel = gameState.upgrades[upgrade.key].level;
      const newLevel = currentLevel + 1;
      
      // Calculate new values
      let newGoonsPerSecond = gameState.goonsPerSecond;
      let newGoonsPerClick = gameState.goonsPerClick;
      
      if (upgrade.key === 'clickPower') {
        const baseClickPower = 1;
        const clickPowerBonus = newLevel * upgrade.baseMultiplier;
        const totalClickPower = baseClickPower + clickPowerBonus;
        newGoonsPerClick = Math.floor(totalClickPower * gameState.prestige.multiplier);
      } else {
        const eventMultiplier = getEventMultiplier(gameState.specialEvents, 'production');
        newGoonsPerSecond = gameState.goonsPerSecond + (upgrade.baseMultiplier * gameState.prestige.multiplier * eventMultiplier);
      }

      // Update game state
      updateGameState({
        goons: gameState.goons - cost,
        goonsPerSecond: newGoonsPerSecond,
        goonsPerClick: newGoonsPerClick,
        upgrades: {
          ...gameState.upgrades,
          [upgrade.key]: {
            ...gameState.upgrades[upgrade.key],
            level: newLevel,
            cost: Math.floor(upgrade.baseCost * Math.pow(1.15, newLevel)),
          },
        },
      });

      // Update statistics
      statisticsService.recordUpgradePurchase();
      notificationService.notifyUpgrade(upgrade.name, newLevel);
    } else {
      // Play error sound effect
      audioService.playSoundEffect('error');
      
      Alert.alert(
        'Cannot Afford',
        `You need ${formatNumber(cost)} goons to purchase this upgrade.`
      );
    }
  };

  const renderUpgradeItem = (upgrade: UpgradeItem) => {
    const currentLevel = gameState.upgrades[upgrade.key].level;
    const cost = calculateUpgradeCost(upgrade);
    const canAfford = canAffordUpgrade(upgrade);
    // Fix: Use correct event type for getEventMultiplier
    const eventMultiplier = getEventMultiplier(gameState.specialEvents, 'upgrades');
    const hasDiscount = eventMultiplier > 1;

    return (
      <TouchableOpacity
        key={upgrade.key}
        style={[
          styles.upgradeItem,
          { backgroundColor: colors.surface },
          canAfford && { borderColor: colors.accent }
        ]}
        onPress={() => purchaseUpgrade(upgrade)}
        disabled={!canAfford}
      >
        <View style={styles.upgradeHeader}>
          <View style={[styles.upgradeIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name={upgrade.icon as any} size={24} color={colors.text} />
          </View>
          <View style={styles.upgradeInfo}>
            <Text style={[styles.upgradeName, { color: colors.text }]}>{upgrade.name}</Text>
            <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
              {upgrade.description}
            </Text>
            <Text style={[styles.upgradeLevel, { color: colors.textSecondary }]}>
              Level {currentLevel}
            </Text>
          </View>
          <View style={styles.upgradeCost}>
            <Text style={[
              styles.costText,
              { color: canAfford ? colors.success : colors.error }
            ]}>
              {formatNumber(cost)}
            </Text>
            {hasDiscount && (
              <Text style={[styles.discountText, { color: colors.accent }]}>
                {eventMultiplier.toFixed(1)}x
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Upgrades</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Purchase upgrades to increase your goon production
            </Text>
          </View>

          {/* Current Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Goons:</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(gameState.goons)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goons per Second:</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(gameState.goonsPerSecond)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goons per Click:</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(gameState.goonsPerClick)}</Text>
            </View>
          </View>

          {/* Upgrades List */}
          <View style={styles.upgradesContainer}>
            {Object.values(upgradeData).map(renderUpgradeItem)}
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  statsCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradesContainer: {
    gap: 15,
  },
  upgradeItem: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  upgradeLevel: {
    fontSize: 12,
  },
  upgradeCost: {
    alignItems: 'flex-end',
  },
  costText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
}); 