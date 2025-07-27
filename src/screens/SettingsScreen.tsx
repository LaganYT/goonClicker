import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useGameContext } from '../context/GameContext';

export default function SettingsScreen() {
  const { 
    gameState, 
    toggleSound, 
    toggleVibration, 
    changeTheme,
    performPrestige 
  } = useGameContext();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const handlePrestige = () => {
    if (gameState.goons >= gameState.prestige.goonsRequired) {
      Alert.alert(
        'Confirm Prestige',
        `Are you sure you want to prestige? This will reset your progress but give you a ${gameState.prestige.multiplier}x multiplier!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Prestige', style: 'destructive', onPress: performPrestige }
        ]
      );
    } else {
      Alert.alert(
        'Cannot Prestige',
        `You need ${formatNumber(gameState.prestige.goonsRequired)} goons to prestige.`
      );
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightComponent: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
      </View>
    </View>
  );

  const renderThemeOption = (theme: 'dark' | 'light' | 'neon', label: string) => (
    <TouchableOpacity
      key={theme}
      style={[
        styles.themeOption,
        gameState.theme === theme && styles.themeOptionSelected
      ]}
      onPress={() => changeTheme(theme)}
    >
      <Text style={[
        styles.themeOptionText,
        gameState.theme === theme && styles.themeOptionTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Settings</Text>
            
            {renderSettingItem(
              'volume-high',
              'Sound Effects',
              'Enable sound effects and music',
              <Switch
                value={gameState.soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#666', true: '#4CAF50' }}
                thumbColor={gameState.soundEnabled ? '#fff' : '#ccc'}
              />
            )}

            {renderSettingItem(
              'phone-portrait',
              'Vibration',
              'Enable haptic feedback',
              <Switch
                value={gameState.vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: '#666', true: '#4CAF50' }}
                thumbColor={gameState.vibrationEnabled ? '#fff' : '#ccc'}
              />
            )}

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="color-palette" size={24} color="#fff" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Theme</Text>
                <Text style={styles.settingSubtitle}>Choose your preferred theme</Text>
              </View>
            </View>
            
            <View style={styles.themeOptions}>
              {renderThemeOption('dark', 'Dark')}
              {renderThemeOption('light', 'Light')}
              {renderThemeOption('neon', 'Neon')}
            </View>
          </View>

          {/* Prestige Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prestige</Text>
            
            <View style={styles.prestigeCard}>
              <LinearGradient
                colors={['#9b59b6', '#8e44ad']}
                style={styles.prestigeGradient}
              >
                <View style={styles.prestigeHeader}>
                  <Ionicons name="refresh" size={32} color="#fff" />
                  <Text style={styles.prestigeTitle}>Prestige Level {gameState.prestige.level}</Text>
                </View>
                
                <View style={styles.prestigeStats}>
                  <View style={styles.prestigeStat}>
                    <Text style={styles.prestigeStatLabel}>Current Multiplier</Text>
                    <Text style={styles.prestigeStatValue}>{gameState.prestige.multiplier}x</Text>
                  </View>
                  <View style={styles.prestigeStat}>
                    <Text style={styles.prestigeStatLabel}>Total Prestige</Text>
                    <Text style={styles.prestigeStatValue}>{gameState.prestige.totalPrestige}</Text>
                  </View>
                </View>

                <View style={styles.prestigeProgress}>
                  <Text style={styles.prestigeProgressText}>
                    Progress: {formatNumber(gameState.goons)} / {formatNumber(gameState.prestige.goonsRequired)}
                  </Text>
                  <View style={styles.prestigeProgressBar}>
                    <View 
                      style={[
                        styles.prestigeProgressFill, 
                        { 
                          width: `${Math.min((gameState.goons / gameState.prestige.goonsRequired) * 100, 100)}%` 
                        }
                      ]} 
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.prestigeButton,
                    gameState.goons < gameState.prestige.goonsRequired && styles.prestigeButtonDisabled
                  ]}
                  onPress={handlePrestige}
                  disabled={gameState.goons < gameState.prestige.goonsRequired}
                >
                  <Text style={styles.prestigeButtonText}>
                    {gameState.goons >= gameState.prestige.goonsRequired ? 'PRESTIGE NOW' : 'NOT ENOUGH GOONS'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Game Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Info</Text>
            
            {renderSettingItem(
              'information-circle',
              'Version',
              'Goon Clicker v1.0.0',
              <Text style={styles.infoText}>v1.0.0</Text>
            )}

            {renderSettingItem(
              'code-slash',
              'Developer',
              'Built with React Native & Expo',
              <Text style={styles.infoText}>React Native</Text>
            )}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  themeOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeOptionSelected: {
    backgroundColor: '#4CAF50',
  },
  themeOptionText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  themeOptionTextSelected: {
    color: '#fff',
  },
  prestigeCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  prestigeGradient: {
    padding: 20,
  },
  prestigeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  prestigeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  prestigeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  prestigeStat: {
    alignItems: 'center',
  },
  prestigeStatLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  prestigeStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  prestigeProgress: {
    marginBottom: 15,
  },
  prestigeProgressText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  prestigeProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  prestigeProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  prestigeButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  prestigeButtonDisabled: {
    backgroundColor: '#666',
  },
  prestigeButtonText: {
    color: '#9b59b6',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 