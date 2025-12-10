import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  PanResponder,
  Dimensions,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AddNewEnquiryScreenProps {
  navigation: any;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const MIN_BUDGET = 0;
const MAX_BUDGET = 10000000;

export const AddNewEnquiryScreen: React.FC<AddNewEnquiryScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();
  const [enquiryFor, setEnquiryFor] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertySearchFor, setPropertySearchFor] = useState('');
  const [propertySearchingIn, setPropertySearchingIn] = useState('');
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [showPropertySearchForPicker, setShowPropertySearchForPicker] =
    useState(false);
  const [activeSlider, setActiveSlider] = useState<'min' | 'max' | null>(null);
  const sliderTrackRef = useRef<View>(null);
  const [trackLayout, setTrackLayout] = useState({
    x: 0,
    width: SLIDER_WIDTH,
    pageX: 0,
  });

  const propertySearchOptions = ['Sale', 'Purchase'];

  const formatEnquiryName = (text: string) => {
    if (text.length === 0) {
      return text;
    }

    let result = '';
    let capitalizeNext = true;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        result += char;
        capitalizeNext = true;
      } else {
        result += capitalizeNext ? char.toUpperCase() : char.toLowerCase();
        capitalizeNext = false;
      }
    }

    return result;
  };

  const getSliderPosition = (value: number) => {
    return (
      ((value - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * trackLayout.width
    );
  };

  const getValueFromPosition = (position: number) => {
    const ratio = Math.max(0, Math.min(1, position / trackLayout.width));
    return Math.round(MIN_BUDGET + ratio * (MAX_BUDGET - MIN_BUDGET));
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setActiveSlider('min');
    },
    onPanResponderMove: (_, gestureState) => {
      const touchX = gestureState.moveX - trackLayout.pageX;
      const newValue = getValueFromPosition(touchX);
      if (newValue < maxBudget && newValue >= MIN_BUDGET) {
        setMinBudget(newValue);
      }
    },
    onPanResponderRelease: () => {
      setActiveSlider(null);
    },
  });

  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setActiveSlider('max');
    },
    onPanResponderMove: (_, gestureState) => {
      const touchX = gestureState.moveX - trackLayout.pageX;
      const newValue = getValueFromPosition(touchX);
      if (newValue > minBudget && newValue <= MAX_BUDGET) {
        setMaxBudget(newValue);
      }
    },
    onPanResponderRelease: () => {
      setActiveSlider(null);
    },
  });

  const handleSubmit = () => {
    if (
      enquiryFor.trim() &&
      mobileNumber.trim() &&
      propertySearchFor &&
      propertySearchingIn.trim()
    ) {
      Alert.alert('Success', 'Enquiry submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
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
          Add New Enquiry
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Input
            label="Enquiry For *"
            value={enquiryFor}
            onChangeText={text => setEnquiryFor(formatEnquiryName(text))}
            placeholder="Enter enquiry name"
            autoCapitalize="words"
            leftIcon={
              <Icon
                name="person"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Input
            label="Mobile Number *"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
            leftIcon={
              <Icon name="phone" size={20} color={theme.colors.textSecondary} />
            }
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address (optional)"
            keyboardType="email-address"
            leftIcon={
              <Icon name="email" size={20} color={theme.colors.textSecondary} />
            }
          />

          <TouchableOpacity
            onPress={() =>
              setShowPropertySearchForPicker(!showPropertySearchForPicker)
            }
            activeOpacity={1}>
            <Input
              label="Property Search For *"
              value={propertySearchFor}
              placeholder="Select property search type"
              editable={false}
              pointerEvents="none"
              leftIcon={
                <Icon
                  name="search"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
              rightIcon={
                <Icon
                  name="arrow-drop-down"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              }
            />
          </TouchableOpacity>

          {showPropertySearchForPicker && (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}>
              {propertySearchOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.7}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor:
                        propertySearchFor === option
                          ? `${theme.colors.primary}20`
                          : theme.colors.surface,
                    },
                  ]}
                  onPress={() => {
                    setPropertySearchFor(option);
                    setShowPropertySearchForPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerText,
                      {
                        color: theme.colors.text,
                        fontWeight:
                          propertySearchFor === option ? '600' : '400',
                      },
                    ]}>
                    {option}
                  </Text>
                  {propertySearchFor === option && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Property Searching In (Address) *"
            value={propertySearchingIn}
            onChangeText={setPropertySearchingIn}
            placeholder="Enter address"
            leftIcon={
              <Icon
                name="location-on"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <View style={styles.budgetContainer}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Budget *
            </Text>
            <View style={styles.budgetValues}>
              <View style={styles.budgetValueItem}>
                <Text
                  style={[
                    styles.budgetLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Min
                </Text>
                <Text style={[styles.budgetValue, {color: theme.colors.text}]}>
                  {formatCurrency(minBudget)}
                </Text>
              </View>
              <View style={styles.budgetValueItem}>
                <Text
                  style={[
                    styles.budgetLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Max
                </Text>
                <Text style={[styles.budgetValue, {color: theme.colors.text}]}>
                  {formatCurrency(maxBudget)}
                </Text>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <View
                ref={sliderTrackRef}
                onLayout={event => {
                  const {width, x} = event.nativeEvent.layout;
                  if (sliderTrackRef.current) {
                    sliderTrackRef.current.measureInWindow((pageX, _pageY) => {
                      setTrackLayout({x, width, pageX});
                    });
                  }
                }}
                style={[
                  styles.sliderTrack,
                  {backgroundColor: theme.colors.border},
                ]}>
                <View
                  style={[
                    styles.sliderActiveTrack,
                    {
                      left: getSliderPosition(minBudget),
                      width:
                        getSliderPosition(maxBudget) -
                        getSliderPosition(minBudget),
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
                <View
                  {...minPanResponder.panHandlers}
                  style={[
                    styles.sliderThumb,
                    {
                      transform: [{translateX: getSliderPosition(minBudget)}],
                      backgroundColor: theme.colors.primary,
                      borderColor:
                        activeSlider === 'min'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.sliderThumbInner,
                      {backgroundColor: theme.colors.background},
                    ]}
                  />
                </View>
                <View
                  {...maxPanResponder.panHandlers}
                  style={[
                    styles.sliderThumb,
                    {
                      transform: [{translateX: getSliderPosition(maxBudget)}],
                      backgroundColor: theme.colors.primary,
                      borderColor:
                        activeSlider === 'max'
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.sliderThumbInner,
                      {backgroundColor: theme.colors.background},
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          <Button
            title="Submit Enquiry"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
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
    padding: 20,
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
    padding: 24,
    paddingBottom: 32,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderRadius: 14,
    marginTop: -8,
    marginBottom: 16,
    padding: 4,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 2,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    color: '#000000',
  },
  budgetContainer: {
    marginBottom: 16,
  },
  budgetValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetValueItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sliderContainer: {
    marginTop: 8,
    paddingVertical: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    width: SLIDER_WIDTH,
  },
  sliderActiveTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  submitButton: {
    marginTop: 24,
  },
});
