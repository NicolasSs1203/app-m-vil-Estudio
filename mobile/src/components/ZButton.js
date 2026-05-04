import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ZButton = ({ title, onPress, type = 'primary', style }) => {
  const { colors, borderRadius, spacing } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.button, 
        { backgroundColor: type === 'primary' ? colors.primary : 'transparent',
          borderColor: colors.primary,
          borderWidth: type === 'outline' ? 1 : 0,
          borderRadius: borderRadius.m,
          padding: spacing.m },
        style
      ]}
    >
      <Text style={[styles.text, { color: type === 'primary' ? '#FFF' : colors.primary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: 'bold', fontSize: 16 }
});