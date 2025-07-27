import { SpecialEvent } from '../types/GameTypes';

export const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: 'double_goons',
    name: 'Double Goons Weekend',
    description: 'All goon production is doubled!',
    startTime: Date.now() + 24 * 60 * 60 * 1000, // Start in 24 hours
    endTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // End in 3 days
    multiplier: 2,
    active: false
  },
  {
    id: 'click_frenzy',
    name: 'Click Frenzy',
    description: 'Clicking produces 5x more goons!',
    startTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // Start in 2 days
    endTime: Date.now() + 2.5 * 24 * 60 * 60 * 1000, // End in 2.5 days
    multiplier: 5,
    active: false
  },
  {
    id: 'upgrade_discount',
    name: 'Upgrade Sale',
    description: 'All upgrades are 50% off!',
    startTime: Date.now() + 4 * 24 * 60 * 60 * 1000, // Start in 4 days
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // End in 5 days
    multiplier: 0.5,
    active: false
  },
  {
    id: 'prestige_boost',
    name: 'Prestige Boost',
    description: 'Prestige gives 3x more multiplier!',
    startTime: Date.now() + 6 * 24 * 60 * 60 * 1000, // Start in 6 days
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // End in 7 days
    multiplier: 3,
    active: false
  }
];

export const getActiveEvents = (events: SpecialEvent[]): SpecialEvent[] => {
  const now = Date.now();
  return events.filter(event => 
    event.startTime <= now && event.endTime > now
  );
};

export const updateEventStatus = (events: SpecialEvent[]): SpecialEvent[] => {
  const now = Date.now();
  return events.map(event => ({
    ...event,
    active: event.startTime <= now && event.endTime > now
  }));
};

export const getEventMultiplier = (events: SpecialEvent[], eventType: 'production' | 'clicking' | 'upgrades' | 'prestige'): number => {
  const activeEvents = getActiveEvents(events);
  let multiplier = 1;
  
  activeEvents.forEach(event => {
    if (event.id === 'double_goons' && eventType === 'production') {
      multiplier *= event.multiplier;
    } else if (event.id === 'click_frenzy' && eventType === 'clicking') {
      multiplier *= event.multiplier;
    } else if (event.id === 'upgrade_discount' && eventType === 'upgrades') {
      multiplier *= event.multiplier;
    } else if (event.id === 'prestige_boost' && eventType === 'prestige') {
      multiplier *= event.multiplier;
    }
  });
  
  return multiplier;
}; 