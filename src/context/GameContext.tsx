import React from 'react';
import { GameContextType } from '../types/GameTypes';

export const GameContext = React.createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 