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
  description: string;
  image?: string;
  date: string;
  time: string;
  onPress: () => void;
  style?: ViewStyle;
  badge?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  date,
  time,
  onPress,
  style,
  badge,
}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        {badge && <View style={styles.badgeContainer}>{badge}</View>}
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, {color: theme.colors.text}]}
            numberOfLines={2}>
            {title}
          </Text>
        </View>
        <Text
          style={[styles.description, {color: theme.colors.textSecondary}]}
          numberOfLines={2}>
          {description}
        </Text>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    padding: 20,
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
