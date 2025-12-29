import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {formatDate, formatTime} from '../utils/dateUtils';
import {makePhoneCall, openWhatsApp} from '../utils/phoneUtils';
import {Status} from '../types';

interface StatusDetailsScreenProps {
  navigation: any;
  route: any;
}

export const StatusDetailsScreen: React.FC<StatusDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {status}: {status: Status} = route.params;

  const handleCall = () => {
    makePhoneCall(status.phoneNumber);
  };

  const handleWhatsApp = () => {
    openWhatsApp(status.phoneNumber, `Hi, regarding ${status.title}`);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'Active':
        return theme.colors.success;
      case 'Completed':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'Active':
        return 'check-circle';
      case 'Completed':
        return 'done-all';
      case 'Pending':
        return 'schedule';
      case 'Cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            paddingTop: insets.top,
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Status Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor() + '20'},
            ]}>
            <Icon name={getStatusIcon()} size={20} color={getStatusColor()} />
            <Text style={[styles.statusText, {color: getStatusColor()}]}>
              {status.status}
            </Text>
          </View>

          <Text style={[styles.title, {color: theme.colors.text}]}>
            {status.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={[styles.metaCard, {backgroundColor: theme.colors.surface}]}>
              <Icon
                name="calendar-today"
                size={18}
                color={theme.colors.primary}
                style={{marginRight: 10}}
              />
              <Text
                style={[styles.metaText, {color: theme.colors.text}]}>
                {formatDate(status.date)}
              </Text>
            </View>
            <View style={[styles.metaCard, styles.metaCardLast, {backgroundColor: theme.colors.surface}]}>
              <Icon
                name="access-time"
                size={18}
                color={theme.colors.primary}
                style={{marginRight: 10}}
              />
              <Text
                style={[styles.metaText, {color: theme.colors.text}]}>
                {formatTime(status.time)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.infoCard, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
              <Icon
                name="person"
                size={20}
                  color={theme.colors.primary}
              />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Enquiry For
                </Text>
                <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                  {status.enquiryFor}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
                <Icon
                  name="phone"
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Mobile Number
                </Text>
                <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                  {status.phoneNumber}
                </Text>
              </View>
            </View>

            {status.email && (
              <View style={styles.infoRow}>
                <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
                <Icon
                  name="email"
                  size={20}
                    color={theme.colors.primary}
                />
                </View>
                <View style={styles.infoContent}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Email
                  </Text>
                  <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                    {status.email}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
              <Icon
                name="search"
                size={20}
                  color={theme.colors.primary}
              />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Property Search For
                </Text>
                <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                  {status.propertySearchFor}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
              <Icon
                name="location-on"
                size={20}
                  color={theme.colors.primary}
              />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Property Searching In
                </Text>
                <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                  {status.propertySearchingIn}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
              <Icon
                name="attach-money"
                size={20}
                  color={theme.colors.primary}
              />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Budget Range
                </Text>
                <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                  {formatCurrency(status.minBudget)} -{' '}
                  {formatCurrency(status.maxBudget)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Call"
              onPress={handleCall}
              variant="outline"
              icon={
                <Icon name="phone" size={20} color={theme.colors.primary} />
              }
              style={{flex: 1, marginRight: 12}}
            />
            <Button
              title="WhatsApp"
              onPress={handleWhatsApp}
              icon={<Icon name="chat" size={20} color="#FFFFFF" />}
              style={{flex: 1}}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  metaCardLast: {
    marginRight: 0,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
});
