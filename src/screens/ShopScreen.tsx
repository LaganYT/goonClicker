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
import { getEventMultiplier } from '../data/specialEvents';

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

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const calculateUpgradeCost = (upgrade: UpgradeItem): number => {
    const currentLevel = gameState.upgrades[upgrade.key].level;
    const baseCost = Math.floor(upgrade.baseCost * Math.pow(1.15, currentLevel));
    const eventMultiplier = getEventMultiplier(gameState.specialEvents, 'upgrades');
    return Math.floor(baseCost * eventMultiplier);
  };

  const canAffordUpgrade = (upgrade: UpgradeItem): boolean => {
    return gameState.goons >= calculateUpgradeCost(upgrade);
  };

  const purchaseUpgrade = (upgrade: UpgradeItem) => {
    const cost = calculateUpgradeCost(upgrade);
    
    if (!canAffordUpgrade(upgrade)) {
      Alert.alert('Not Enough Goons', 'You need more goons to buy this upgrade!');
      return;
    }

    // Haptic feedback - disabled for compatibility
    // try {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // } catch (error) {
    //   // Haptics not available on this platform
    // }

    const newUpgrades = { ...gameState.upgrades };
    newUpgrades[upgrade.key].level += 1;
    newUpgrades[upgrade.key].cost = Math.floor(upgrade.baseCost * Math.pow(1.15, newUpgrades[upgrade.key].level));

    let newGoonsPerClick = gameState.goonsPerClick;
    let newGoonsPerSecond = gameState.goonsPerSecond;

    // Update stats based on upgrade type
    if (upgrade.key === 'clickPower') {
      newGoonsPerClick = upgrade.baseMultiplier * newUpgrades[upgrade.key].level;
    } else {
      newGoonsPerSecond += upgrade.baseMultiplier;
    }

    updateGameState({
      goons: gameState.goons - cost,
      goonsPerClick: newGoonsPerClick,
      goonsPerSecond: newGoonsPerSecond,
      upgrades: newUpgrades,
    });

    Alert.alert('Upgrade Purchased!', `${upgrade.name} upgraded to level ${newUpgrades[upgrade.key].level}!`);
  };

  const renderUpgradeItem = (upgrade: UpgradeItem) => {
    const cost = calculateUpgradeCost(upgrade);
    const currentLevel = gameState.upgrades[upgrade.key].level;
    const canAfford = canAffordUpgrade(upgrade);

    return (
      <View key={upgrade.key} style={styles.upgradeItem}>
        <LinearGradient
          colors={canAfford ? ['#4a90e2', '#357abd'] : ['#666', '#444']}
          style={styles.upgradeGradient}
        >
          <View style={styles.upgradeHeader}>
            <View style={styles.upgradeIconContainer}>
              <Ionicons name={upgrade.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>{upgrade.name}</Text>
              <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
              <Text style={styles.upgradeLevel}>Level: {currentLevel}</Text>
            </View>
          </View>
          
          <View style={styles.upgradeFooter}>
            <Text style={styles.upgradeCost}>{formatNumber(cost)} Goons</Text>
            <TouchableOpacity
              style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
              onPress={() => purchaseUpgrade(upgrade)}
              disabled={!canAfford}
            >
              <Text style={styles.buyButtonText}>
                {canAfford ? 'BUY' : 'CAN\'T AFFORD'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upgrades</Text>
        <View style={styles.goonDisplay}>
          <Ionicons name="diamond-outline" size={20} color="#ff6b6b" />
          <Text style={styles.goonCount}>{formatNumber(gameState.goons)}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.upgradesContainer}>
          {Object.values(upgradeData).map(renderUpgradeItem)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  goonDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goonCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  upgradesContainer: {
    padding: 20,
  },
  upgradeItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  upgradeGradient: {
    padding: 20,
  },
  upgradeHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  upgradeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upgradeDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  upgradeLevel: {
    color: '#aaa',
    fontSize: 12,
  },
  upgradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeCost: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyButtonDisabled: {
    backgroundColor: '#666',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 