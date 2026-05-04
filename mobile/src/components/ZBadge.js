import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ZBadge = ({ label, status = 'success' }) => {
  const { colors, borderRadius, spacing } = useTheme();
  const getBgColor = () => colors[status] || colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: getBgColor() + '20', borderRadius: borderRadius.s }]}>
      <Text style={[styles.text, { color: getBgColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
});