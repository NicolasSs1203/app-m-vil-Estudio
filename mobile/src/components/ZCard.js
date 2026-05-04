import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ZCard = ({ children, style }) => {
  const { colors, borderRadius, spacing } = useTheme();
  return (
    <View style={[
      styles.card, 
      { backgroundColor: colors.surface, borderRadius: borderRadius.l, padding: spacing.m },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(80, 160, 255, 0.1)' }
});