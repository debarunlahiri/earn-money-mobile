import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FallingRupees} from './FallingRupee';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';

const sampleProfileImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';

interface HomeHeaderProps {
  activeTab: 'PastEnquiries' | 'Status' | 'Leads';
  onProfilePress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  activeTab,
  onProfilePress,
}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {headerTranslateY} = useScrollVisibility();

  const getHeaderData = () => {
    if (activeTab === 'Leads') {
      return {
        title: 'My Leads',
        subtitle: 'All your property leads',
      };
    }
    if (activeTab === 'PastEnquiries') {
      return {
        title: 'Past Enquiries',
        subtitle: 'Your property enquiries',
      };
    }
    return {
      title: 'Status',
      subtitle: 'Recent updates',
    };
  };

  const headerData = getHeaderData();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Animated.View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        <FallingRupees count={12} />
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
              {headerData.title}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {color: theme.colors.textSecondary},
              ]}>
              {headerData.subtitle}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onProfilePress}
            style={styles.profileButton}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{uri: sampleProfileImage}}
                style={styles.profileImage}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.6)',
  },
  headerTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.75,
    fontWeight: '400',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(212, 175, 55, 0.7)',
    backgroundColor: 'rgba(139, 69, 19, 0.25)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

