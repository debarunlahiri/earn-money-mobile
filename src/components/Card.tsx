import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {formatDate, formatTime} from '../utils/dateUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  date: string;
  time: string;
  onPress: () => void;
  style?: ViewStyle;
  badge?: React.ReactNode;
  propertyType?: string;
  propertyArea?: string;
  propertyLocation?: string;
  propertyPrice?: string;
}

const PropertyDetailPill: React.FC<{
  icon: string;
  text: string;
  theme: any;
  color: string;
}> = ({icon, text, theme, color}) => {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: color + '20',
          borderColor: color + '60',
          borderWidth: 1.5,
        },
      ]}>
      <Icon
        name={icon}
        size={16}
        color={color}
        style={styles.pillIcon}
      />
      <Text style={[styles.pillText, {color: color}]}>
        {text}
      </Text>
    </View>
  );
};

export const Card: React.FC<CardProps> = ({
  title,
  description,
  date,
  time,
  onPress,
  style,
  badge,
  propertyType,
  propertyArea,
  propertyLocation,
  propertyPrice,
}) => {
  const {theme} = useTheme();

  const propertyDetails = [];
  if (propertyType) {
    propertyDetails.push({
      icon: 'home',
      text: propertyType,
      color: theme.colors.primary, // Blue
    });
  }
  if (propertyArea) {
    propertyDetails.push({
      icon: 'square-foot',
      text: propertyArea,
      color: '#00D4FF', // Cyan - more visible in dark mode
    });
  }
  if (propertyLocation) {
    propertyDetails.push({
      icon: 'location-on',
      text: propertyLocation,
      color: '#FF9500', // Orange - visible in dark mode
    });
  }
  if (propertyPrice) {
    propertyDetails.push({
      icon: 'attach-money',
      text: propertyPrice,
      color: theme.colors.success, // Green for money
    });
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
      <View style={styles.glassContainer}>
        <View style={styles.glassBaseLayer} />
        <View style={styles.glassFrostLayer} />
        <View style={styles.glassHighlight} />
        <View style={styles.glassInnerBorder} />
        <View style={styles.glassContent}>
        {badge && <View style={styles.badgeContainer}>{badge}</View>}
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, {color: theme.colors.text}]}
            numberOfLines={2}>
            {title}
          </Text>
        </View>
        {propertyDetails.length > 0 ? (
          <View style={styles.propertyDetailsContainer}>
            {propertyDetails.map((detail, index) => (
              <PropertyDetailPill
                key={index}
                icon={detail.icon}
                text={detail.text}
                theme={theme}
                color={detail.color}
              />
            ))}
          </View>
        ) : description ? (
          <Text
            style={[styles.description, {color: theme.colors.textSecondary}]}
            numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Icon
              name="access-time"
              size={14}
              color={theme.colors.textSecondary}
              style={styles.dateIcon}
            />
            <Text style={[styles.date, {color: theme.colors.textSecondary}]}>
              {formatDate(date)} • {formatTime(time)}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  glassContainer: {
    borderRadius: 20,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  glassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    pointerEvents: 'none',
  },
  glassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 19.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  glassContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
    opacity: 0.75,
  },
  propertyDetailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: -8,
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 13,
    opacity: 0.7,
  },
});
