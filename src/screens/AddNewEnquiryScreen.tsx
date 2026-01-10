import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {Dialog} from '../components/Dialog';
import {EnhancedTouchable} from '../components/EnhancedTouchable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {INDIA_STATES} from '../data/indiaStates';
import {INDIA_CITIES, getCitiesByState} from '../data/indiaCities';
import {getSectorsByCity} from '../data/indiaSectors';
import {useAuth} from '../context/AuthContext';
import {addLead} from '../services/api';

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
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const [enquiryFor, setEnquiryFor] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertySearchFor, setPropertySearchFor] = useState('');
  const [propertySearchingIn, setPropertySearchingIn] = useState('');
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [showPropertyTypePicker, setShowPropertyTypePicker] = useState(false);
  const [showPropertySearchForPicker, setShowPropertySearchForPicker] =
    useState(false);
  const [activeSlider, setActiveSlider] = useState<'min' | 'max' | null>(null);
  const sliderTrackRef = useRef<View>(null);
  const [trackLayout, setTrackLayout] = useState({
    x: 0,
    width: SLIDER_WIDTH,
    pageX: 0,
  });

  // Location dropdown states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sector, setSector] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showSectorPicker, setShowSectorPicker] = useState(false);

  // Pincode states
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
  const [dialogOnConfirm, setDialogOnConfirm] = useState<(() => void) | undefined>(undefined);

  // Get sorted states alphabetically
  const sortedStates = [...INDIA_STATES].sort((a, b) => a.name.localeCompare(b.name));

  // Get filtered and sorted cities based on selection
  const filteredCities = selectedState 
    ? getCitiesByState(selectedState).sort((a, b) => a.name.localeCompare(b.name)) 
    : [];

  // Get filtered sectors based on selected city
  const filteredSectors = selectedCity 
    ? getSectorsByCity(selectedCity).sort((a, b) => a.name.localeCompare(b.name)) 
    : [];

  // Get display names for selected values
  const getStateName = (stateId: string) => {
    const state = INDIA_STATES.find(s => s.id === stateId);
    return state ? state.name : '';
  };

  const getCityName = (cityId: string) => {
    const city = INDIA_CITIES.find(c => c.id === cityId);
    return city ? city.name : '';
  };

  // Handle state change - reset city
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setShowStatePicker(false);
  };

  // Handle city change
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedSector('');
    setShowCityPicker(false);
  };

  // Get sector name from id
  const getSectorName = (sectorId: string) => {
    const sectors = getSectorsByCity(selectedCity);
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : '';
  };

  // Handle sector change
  const handleSectorChange = (sectorId: string) => {
    setSelectedSector(sectorId);
    setShowSectorPicker(false);
  };

  // Handle pincode change and auto-fill
  const handlePincodeChange = useCallback(async (text: string) => {
    // Only allow digits and max 6 characters
    const cleanedPincode = text.replace(/\D/g, '').substring(0, 6);
    setPincode(cleanedPincode);
    setPincodeError('');
    
    // If pincode is 6 digits, fetch data from API
    if (cleanedPincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${cleanedPincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const stateName = postOffice.State;
          const districtName = postOffice.District;
          const localityName = postOffice.Name;
          
          // Auto-fill sector/locality with post office name
          if (localityName) {
            setSector(localityName);
          }
          
          // Find matching state
          const matchedState = INDIA_STATES.find(
            s => s.name.toLowerCase() === stateName.toLowerCase()
          );
          
          if (matchedState) {
            setSelectedState(matchedState.id);
            
            // Find matching city/district
            const citiesInState = getCitiesByState(matchedState.id);
            const matchedCity = citiesInState.find(
              c => c.name.toLowerCase() === districtName.toLowerCase()
            );
            
            if (matchedCity) {
              setSelectedCity(matchedCity.id);
            } else {
              // If exact match not found, try to find partial match
              const partialMatch = citiesInState.find(
                c => c.name.toLowerCase().includes(districtName.toLowerCase()) ||
                     districtName.toLowerCase().includes(c.name.toLowerCase())
              );
              if (partialMatch) {
                setSelectedCity(partialMatch.id);
              } else {
                setSelectedCity('');
              }
            }
          }
          setPincodeError('');
        } else {
          setPincodeError('Invalid pincode');
        }
      } catch (error) {
        console.log('Pincode API error:', error);
        setPincodeError('Unable to fetch pincode details');
      } finally {
        setPincodeLoading(false);
      }
    }
  }, []);

  const propertyTypeOptions = ['Rent', 'Purchase', 'Plot'];
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

  const showDialog = (
    message: string,
    title?: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
    onConfirm?: () => void,
  ) => {
    setDialogTitle(title || '');
    setDialogMessage(message);
    setDialogType(type);
    // Wrap the function in another function to prevent React from calling it as a lazy initializer
    setDialogOnConfirm(() => onConfirm);
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (
      !enquiryFor.trim() ||
      !mobileNumber.trim() ||
      !propertyType ||
      !propertySearchFor ||
      !propertySearchingIn.trim()
    ) {
      showDialog('Please fill in all required fields', 'Error', 'error');
      return;
    }

    if (!userData?.userid || !userData?.token) {
      showDialog('Authentication error. Please login again.', 'Error', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build the requirement string with all relevant details
      const requirementDetails = [
        `Property Type: ${propertyType}`,
        `Property Search: ${propertySearchFor}`,
        `Budget: ${formatCurrency(minBudget)} - ${formatCurrency(maxBudget)}`,
        getStateName(selectedState) && `State: ${getStateName(selectedState)}`,
        getCityName(selectedCity) && `City: ${getCityName(selectedCity)}`,
        getSectorName(selectedSector) && `Sector: ${getSectorName(selectedSector)}`,
        email && `Email: ${email}`,
      ].filter(Boolean).join(', ');

      const response = await addLead({
        userid: userData.userid,
        token: userData.token,
        leadname: enquiryFor.trim(),
        leadmobile: mobileNumber.trim(),
        address: propertySearchingIn.trim(),
        requirement: requirementDetails,
      });

      if (response.status === 'success') {
        showDialog(
          response.message || 'Enquiry submitted successfully!',
          'Success',
          'success',
          () => navigation.goBack(),
        );
      } else {
        showDialog(
          response.message || 'Failed to submit enquiry',
          'Error',
          'error',
        );
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      showDialog(
        'An error occurred while submitting the enquiry. Please try again.',
        'Error',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
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
        <EnhancedTouchable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </EnhancedTouchable>
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
            label="Lead For *"
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

          <EnhancedTouchable
            onPress={() => {
              setShowPropertyTypePicker(!showPropertyTypePicker);
              setShowPropertySearchForPicker(false);
            }}
            activeOpacity={1}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
            <Input
              label="Property Type *"
              value={propertyType}
              placeholder="Select property type"
              editable={false}
              pointerEvents="none"
              leftIcon={
                <Icon
                  name="home"
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
          </EnhancedTouchable>

          {showPropertyTypePicker && (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}>
              {propertyTypeOptions.map(option => (
                <EnhancedTouchable
                  key={option}
                  activeOpacity={0.7}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  hitSlopSize="small"
                  onPress={() => {
                    setPropertyType(option);
                    setShowPropertyTypePicker(false);
                  }}>
                  <Text
                    style={[
                      styles.pickerText,
                      {
                        color: theme.colors.text,
                        fontWeight:
                          propertyType === option ? '600' : '400',
                      },
                    ]}>
                    {option}
                  </Text>
                </EnhancedTouchable>
              ))}
            </View>
          )}

          <EnhancedTouchable
            onPress={() => {
              setShowPropertySearchForPicker(!showPropertySearchForPicker);
              setShowPropertyTypePicker(false);
            }}
            activeOpacity={1}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
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
          </EnhancedTouchable>

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
                <EnhancedTouchable
                  key={option}
                  activeOpacity={0.7}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor: theme.colors.surface,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  hitSlopSize="small"
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
                </EnhancedTouchable>
              ))}
            </View>
          )}

          <Input
            label="Property Searching In (Address) *"
            value={propertySearchingIn}
            onChangeText={setPropertySearchingIn}
            placeholder="Enter address"
            maxLength={80}
            leftIcon={
              <Icon
                name="location-on"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
            rightIcon={
              <Text style={{color: propertySearchingIn.length >= 70 ? '#FF6B6B' : theme.colors.textSecondary, fontSize: 12}}>
                {propertySearchingIn.length}/80
              </Text>
            }
          />

          {/* Pincode */}
          <Input
            label="Pincode *"
            value={pincode}
            onChangeText={handlePincodeChange}
            placeholder="Enter 6-digit pincode"
            keyboardType="numeric"
            maxLength={6}
            error={pincodeError}
            leftIcon={
              <Icon
                name="pin-drop"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
            rightIcon={
              pincodeLoading ? (
                <Text style={{color: theme.colors.textSecondary, fontSize: 12}}>Loading...</Text>
              ) : pincode.length === 6 && !pincodeError ? (
                <Icon name="check-circle" size={20} color="#4CAF50" />
              ) : null
            }
          />

          {/* Sector/Locality Text Field */}
          <Input
            label="Sector/Locality"
            value={sector}
            onChangeText={setSector}
            placeholder="Enter sector/locality (optional)"
            leftIcon={
              <Icon
                name="apartment"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          {/* State Dropdown */}
          <EnhancedTouchable
            onPress={() => {
              setShowStatePicker(!showStatePicker);
              setShowCityPicker(false);
            }}
            activeOpacity={1}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
            <Input
              label="State *"
              value={getStateName(selectedState)}
              placeholder="Select state"
              editable={false}
              pointerEvents="none"
              leftIcon={
                <Icon
                  name="map"
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
          </EnhancedTouchable>

          {showStatePicker && (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}>
              <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                {sortedStates.map(state => (
                  <EnhancedTouchable
                    key={state.id}
                    activeOpacity={0.7}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                    hitSlopSize="small"
                    onPress={() => handleStateChange(state.id)}>
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          color: theme.colors.text,
                          fontWeight:
                            selectedState === state.id ? '600' : '400',
                        },
                      ]}>
                      {state.name}
                    </Text>
                  </EnhancedTouchable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* City Dropdown */}
          <EnhancedTouchable
            onPress={() => {
              if (selectedState) {
                setShowCityPicker(!showCityPicker);
                setShowStatePicker(false);
              } else {
                showDialog('Please select a state first', undefined, 'info');
              }
            }}
            activeOpacity={1}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
            <Input
              label="City *"
              value={getCityName(selectedCity)}
              placeholder={selectedState ? "Select city" : "Select state first"}
              editable={false}
              pointerEvents="none"
              leftIcon={
                <Icon
                  name="location-city"
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
          </EnhancedTouchable>

          {showCityPicker && filteredCities.length > 0 && (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                },
              ]}>
              <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                {filteredCities.map(city => (
                  <EnhancedTouchable
                    key={city.id}
                    activeOpacity={0.7}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                    hitSlopSize="small"
                    onPress={() => handleCityChange(city.id)}>
                    <Text
                      style={[
                        styles.pickerText,
                        {
                          color: theme.colors.text,
                          fontWeight:
                            selectedCity === city.id ? '600' : '400',
                        },
                      ]}>
                      {city.name}
                    </Text>
                  </EnhancedTouchable>
                ))}
              </ScrollView>
            </View>
          )}


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
            title={isSubmitting ? "Submitting..." : "Submit Enquiry"}
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <Dialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        onClose={() => setDialogVisible(false)}
        onConfirm={dialogOnConfirm}
      />
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
    borderRadius: 8,
    marginTop: -36,
    marginBottom: 16,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'hidden',
    elevation: 5,
    zIndex: 1000,
  },
  pickerScrollView: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    borderBottomWidth: 1,
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
