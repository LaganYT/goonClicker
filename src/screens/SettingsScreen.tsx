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
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useGameContext } from '../context/GameContext';
import { useTheme } from '../hooks/useTheme';
import { audioService } from '../services/AudioService';
import { notificationService } from '../services/NotificationService';

export default function SettingsScreen() {
  const { 
    gameState, 
    toggleSound, 
    toggleMusic,
    setSoundVolume,
    setMusicVolume,
    toggleVibration, 
    toggleAutoSave,
    toggleNotifications,
    toggleParticleEffects,
    changeTheme,
    performPrestige 
  } = useGameContext();

  const { colors } = useTheme();

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

  const handleToggleSound = () => {
    console.log('Toggle sound called, current state:', gameState.soundEnabled);
    toggleSound();
  };

  const handleToggleMusic = () => {
    console.log('Toggle music called, current state:', gameState.musicEnabled);
    toggleMusic();
  };

  const handleSetSoundVolume = (volume: number) => {
    console.log('Set sound volume called:', volume);
    setSoundVolume(volume);
  };

  const handleSetMusicVolume = (volume: number) => {
    console.log('Set music volume called:', volume);
    setMusicVolume(volume);
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightComponent: React.ReactNode
  ) => (
    <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
        <Ionicons name={icon as any} size={24} color={colors.text} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
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
        { backgroundColor: colors.surface },
        gameState.theme === theme && { backgroundColor: colors.accent }
      ]}
      onPress={() => changeTheme(theme)}
    >
      <Text style={[
        styles.themeOptionText,
        { color: colors.textSecondary },
        gameState.theme === theme && { color: colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          {/* Game Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Settings</Text>
            
            {renderSettingItem(
              'volume-high',
              'Sound Effects',
              'Enable sound effects',
              <Switch
                value={gameState.soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.soundEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {renderSettingItem(
              'musical-notes',
              'Background Music',
              'Enable background music',
              <Switch
                value={gameState.musicEnabled}
                onValueChange={handleToggleMusic}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.musicEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {renderSettingItem(
              'phone-portrait',
              'Vibration',
              'Enable haptic feedback',
              <Switch
                value={gameState.vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.vibrationEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {renderSettingItem(
              'save',
              'Auto Save',
              'Automatically save game progress',
              <Switch
                value={gameState.autoSaveEnabled}
                onValueChange={toggleAutoSave}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.autoSaveEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {renderSettingItem(
              'notifications',
              'Notifications',
              'Enable push notifications',
              <Switch
                value={gameState.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.notificationsEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {renderSettingItem(
              'sparkles',
              'Particle Effects',
              'Enable visual particle effects',
              <Switch
                value={gameState.particleEffectsEnabled}
                onValueChange={toggleParticleEffects}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={gameState.particleEffectsEnabled ? colors.text : colors.textSecondary}
              />
            )}

            {/* Volume Controls */}
            <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="volume-high" size={24} color={colors.text} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Sound Volume</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Adjust sound effects volume</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={gameState.soundVolume}
                  onValueChange={handleSetSoundVolume}
                  minimumTrackTintColor={colors.success}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.text}
                />
              </View>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="musical-notes" size={24} color={colors.text} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Music Volume</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Adjust background music volume</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={gameState.musicVolume}
                  onValueChange={handleSetMusicVolume}
                  minimumTrackTintColor={colors.success}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.text}
                />
              </View>
            </View>

            <View style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="color-palette" size={24} color={colors.text} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Choose your preferred theme</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Prestige</Text>
            
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Info</Text>
            
            {renderSettingItem(
              'information-circle',
              'Version',
              'Goon Clicker v1.0.0',
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>v1.0.0</Text>
            )}

            {renderSettingItem(
              'code-slash',
              'Developer',
              'Built with React Native & Expo',
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>React Native</Text>
            )}
          </View>

          {/* Test Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Audio</Text>
            
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Test the audio system with actual sound effects and background music.
            </Text>
            
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                console.log('Testing audio...');
                audioService.playSoundEffect('click');
              }}
            >
              <Text style={[styles.testButtonText, { color: colors.text }]}>Test Click Sound</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                console.log('Testing upgrade sound...');
                audioService.playSoundEffect('upgrade');
              }}
            >
              <Text style={[styles.testButtonText, { color: colors.text }]}>Test Upgrade Sound</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                console.log('Testing background music...');
                audioService.playBackgroundMusic();
              }}
            >
              <Text style={[styles.testButtonText, { color: colors.text }]}>Test Background Music</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 10,
  },
  infoText: {
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
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 