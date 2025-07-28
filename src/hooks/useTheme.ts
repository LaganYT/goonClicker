import { useGameContext } from '../context/GameContext';
import { THEMES, Theme } from '../types/GameTypes';

export const useTheme = () => {
  const { gameState } = useGameContext();
  const currentTheme = THEMES[gameState.theme] || THEMES.dark;
  
  return {
    theme: currentTheme,
    colors: currentTheme.colors,
    isDark: gameState.theme === 'dark',
    isLight: gameState.theme === 'light',
    isNeon: gameState.theme === 'neon',
  };
}; 