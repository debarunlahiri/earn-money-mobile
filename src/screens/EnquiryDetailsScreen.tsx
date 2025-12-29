import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {formatDate, formatTime} from '../utils/dateUtils';
import {makePhoneCall, openWhatsApp} from '../utils/phoneUtils';
import {Enquiry} from '../types';

interface EnquiryDetailsScreenProps {
  navigation: any;
  route: any;
}

export const EnquiryDetailsScreen: React.FC<EnquiryDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {enquiry}: {enquiry: Enquiry} = route.params;

  const handleCall = () => {
    makePhoneCall(enquiry.phoneNumber);
  };

  const handleWhatsApp = () => {
    openWhatsApp(enquiry.phoneNumber, `Hi, I'm interested in ${enquiry.title}`);
  };

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
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
          Enquiry Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
        <Image source={{uri: enquiry.image}} style={styles.image} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {enquiry.title}
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
                {formatDate(enquiry.date)}
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
                {formatTime(enquiry.time)}
              </Text>
            </View>
          </View>

          {enquiry.propertyType && (
            <View
              style={[styles.infoCard, {backgroundColor: theme.colors.surface}]}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Property Details
              </Text>
              <View style={styles.detailsContainer}>
                {enquiry.propertyType && (
                  <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
                      <Icon
                        name="category"
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
                        Property Type
                    </Text>
                    <Text
                        style={[styles.infoValue, {color: theme.colors.text}]}>
                      {enquiry.propertyType}
                    </Text>
                    </View>
                  </View>
                )}
                {enquiry.propertyPrice && (
                  <View style={styles.infoRow}>
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
                      Price
                    </Text>
                    <Text
                        style={[styles.infoValue, {color: theme.colors.text}]}>
                      {enquiry.propertyPrice}
                    </Text>
                    </View>
                  </View>
                )}
                {enquiry.propertyLocation && (
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
                      Location
                    </Text>
                    <Text
                        style={[styles.infoValue, {color: theme.colors.text}]}>
                      {enquiry.propertyLocation}
                    </Text>
                    </View>
                  </View>
                )}
                {enquiry.propertyArea && (
                  <View style={styles.infoRow}>
                    <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
                      <Icon
                        name="aspect-ratio"
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
                      Area
                    </Text>
                    <Text
                        style={[styles.infoValue, {color: theme.colors.text}]}>
                      {enquiry.propertyArea}
                    </Text>
                    </View>
                  </View>
                )}
                {enquiry.propertyStatus && (
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <View style={[styles.iconContainer, {backgroundColor: `${theme.colors.primary}15`}]}>
                      <Icon
                        name="check-circle"
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
                        Status
                      </Text>
                      <Text
                        style={[styles.infoValue, {color: theme.colors.text}]}>
                        {enquiry.propertyStatus}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

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
  imageContainer: {
    width: '100%',
    height: 320,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
    paddingTop: 24,
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
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  detailsContainer: {
    marginTop: 4,
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
