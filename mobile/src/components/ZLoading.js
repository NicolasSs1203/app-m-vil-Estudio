import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ZLoading = () => {
  const { colors } = useTheme();
  const pulse = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.circle, 
        { backgroundColor: colors.primary, transform: [{ scale: pulse }] }
      ]} />
      <Animated.View style={[
        styles.circle, 
        { backgroundColor: colors.primary, opacity: 0.3, transform: [{ scale: pulse }] }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', height: 100 },
  circle: { width: 20, height: 20, borderRadius: 10, position: 'absolute' }
});