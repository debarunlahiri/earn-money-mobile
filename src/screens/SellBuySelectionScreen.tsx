import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {LinearGradient} from 'expo-linear-gradient';

interface SellBuySelectionScreenProps {
  navigation: any;
}

export const SellBuySelectionScreen: React.FC<SellBuySelectionScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();

  const handleSelection = (type: 'sell' | 'buy') => {
    navigation.navigate('PropertyForm', {enquiryType: type});
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
          Create New Enquiry
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          What would you like to do?
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Select an option to continue
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelection('sell')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.optionGradient}>
              <View style={styles.optionIconContainer}>
                <Icon name="sell" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.optionTitle}>Sell Property</Text>
              <Text style={styles.optionDescription}>
                List your property for sale
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelection('buy')}
            activeOpacity={0.8}>
            <View
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.optionIconContainer,
                  {backgroundColor: theme.colors.primary + '20'},
                ]}>
                <Icon
                  name="shopping-cart"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.optionTitle, {color: theme.colors.text}]}>
                Buy Property
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Find your dream property
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  optionsContainer: {
    gap: 24,
  },
  option: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  optionGradient: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 20,
  },
  optionCard: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
  },
  optionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});
