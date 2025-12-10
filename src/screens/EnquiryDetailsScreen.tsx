import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
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
  const {theme} = useTheme();
  const {enquiry}: {enquiry: Enquiry} = route.params;

  const handleCall = () => {
    makePhoneCall(enquiry.phoneNumber);
  };

  const handleWhatsApp = () => {
    openWhatsApp(enquiry.phoneNumber, `Hi, I'm interested in ${enquiry.title}`);
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
          Enquiry Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Image source={{uri: enquiry.image}} style={styles.image} />

        <View style={styles.content}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {enquiry.title}
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
                {formatDate(enquiry.date)}
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
                {formatTime(enquiry.time)}
              </Text>
            </View>
          </View>

          <View style={[styles.section, {borderTopColor: theme.colors.border}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Description
            </Text>
            <Text
              style={[styles.description, {color: theme.colors.textSecondary}]}>
              {enquiry.description}
            </Text>
          </View>

          {enquiry.propertyType && (
            <View
              style={[styles.section, {borderTopColor: theme.colors.border}]}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Property Details
              </Text>
              <View style={styles.detailsGrid}>
                {enquiry.propertyType && (
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Type
                    </Text>
                    <Text
                      style={[styles.detailValue, {color: theme.colors.text}]}>
                      {enquiry.propertyType}
                    </Text>
                  </View>
                )}
                {enquiry.propertyPrice && (
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Price
                    </Text>
                    <Text
                      style={[styles.detailValue, {color: theme.colors.text}]}>
                      {enquiry.propertyPrice}
                    </Text>
                  </View>
                )}
                {enquiry.propertyLocation && (
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Location
                    </Text>
                    <Text
                      style={[styles.detailValue, {color: theme.colors.text}]}>
                      {enquiry.propertyLocation}
                    </Text>
                  </View>
                )}
                {enquiry.propertyArea && (
                  <View style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Area
                    </Text>
                    <Text
                      style={[styles.detailValue, {color: theme.colors.text}]}>
                      {enquiry.propertyArea}
                    </Text>
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
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
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
