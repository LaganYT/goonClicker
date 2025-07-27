import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
}

interface ParticleSystemProps {
  enabled: boolean;
  trigger: boolean;
  onTriggerComplete: () => void;
}

export default function ParticleSystem({ enabled, trigger, onTriggerComplete }: ParticleSystemProps) {
  const particles = useRef<Particle[]>([]);
  const particleCounter = useRef(0);

  useEffect(() => {
    if (enabled && trigger) {
      createParticles();
    }
  }, [trigger, enabled]);

  const createParticles = () => {
    const newParticles: Particle[] = [];
    
    // Create 8 particles in a circle around the center
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      
      const particle: Particle = {
        id: particleCounter.current++,
        x: new Animated.Value(Math.cos(angle) * distance),
        y: new Animated.Value(Math.sin(angle) * distance),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        rotation: new Animated.Value(0),
      };
      
      newParticles.push(particle);
      
      // Animate particle
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: Math.cos(angle) * (distance + 100),
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: Math.sin(angle) * (distance + 100),
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 360,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    particles.current = newParticles;
    
    // Clean up particles after animation
    setTimeout(() => {
      particles.current = [];
      onTriggerComplete();
    }, 1500);
  };

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                { rotate: particle.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
}); 