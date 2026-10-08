import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme/colors';

export const Badge = ({ label, color = THEME.accentCyan, bgColor, size = 'sm', icon }) => {
  const isSm = size === 'sm';
  return (
    <View style={[
      styles.badgeContainer,
      {
        backgroundColor: bgColor || `${color}1A`, // 10% opacity
        borderColor: `${color}40`,
        paddingHorizontal: isSm ? 6 : 10,
        paddingVertical: isSm ? 2 : 4,
      }
    ]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[
        styles.badgeText,
        {
          color: color,
          fontSize: isSm ? 10 : 12,
        }
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconWrapper: {
    marginRight: 4,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
