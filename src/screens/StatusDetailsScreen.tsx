import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
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
  const {theme} = useTheme();
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
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={[styles.header, {borderBottomColor: theme.colors.border}]}>
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
            <View style={styles.metaItem}>
              <Icon
                name="calendar-today"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.metaText, {color: theme.colors.textSecondary}]}>
                {formatDate(status.date)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon
                name="access-time"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.metaText, {color: theme.colors.textSecondary}]}>
                {formatTime(status.time)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.infoCard, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.infoRow}>
              <Icon
                name="person"
                size={20}
                color={theme.colors.textSecondary}
              />
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
              <Icon name="phone" size={20} color={theme.colors.textSecondary} />
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
                <Icon
                  name="email"
                  size={20}
                  color={theme.colors.textSecondary}
                />
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
              <Icon
                name="search"
                size={20}
                color={theme.colors.textSecondary}
              />
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
              <Icon
                name="location-on"
                size={20}
                color={theme.colors.textSecondary}
              />
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

            <View style={styles.infoRow}>
              <Icon
                name="attach-money"
                size={20}
                color={theme.colors.textSecondary}
              />
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

          <View style={[styles.section, {borderTopColor: theme.colors.border}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Description
            </Text>
            <Text
              style={[styles.description, {color: theme.colors.textSecondary}]}>
              {status.description}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Call"
              onPress={handleCall}
              variant="outline"
              icon={
                <Icon name="phone" size={20} color={theme.colors.primary} />
              }
              style={{flex: 1, marginRight: 8}}
            />
            <Button
              title="WhatsApp"
              onPress={handleWhatsApp}
              variant="outline"
              icon={<Icon name="chat" size={20} color={theme.colors.primary} />}
              style={{flex: 1, marginLeft: 8}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 24,
  },
  content: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 6,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 32,
    marginBottom: 16,
  },
  actionButton: {
    marginHorizontal: 0,
  },
});
