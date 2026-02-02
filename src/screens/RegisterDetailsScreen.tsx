import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {useNotifications} from '../context/NotificationContext';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {Toast, ToastType} from '../components/Toast';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FallingRupees} from '../components/FallingRupee';
import {INDIA_STATES} from '../data/indiaStates';
import {INDIA_CITIES, getCitiesByState} from '../data/indiaCities';
import {
  isValidIndianAccountNumber,
  formatAccountNumber,
  isValidIndianIFSC,
  formatIFSCCode,
  formatIndianPhoneNumber,
  isValidUPI,
  formatUPIId,
} from '../utils/phoneUtils';
import {registerUser} from '../services/api';
import * as Location from 'expo-location';

interface RegisterDetailsScreenProps {
  navigation: any;
  route: any;
}

export const RegisterDetailsScreen: React.FC<RegisterDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const {login, userData: authUserData} = useAuth();
  const {fcmToken} = useNotifications();
  const insets = useSafeAreaInsets();
  
  // Get userData from route params (passed from OTP screen) or from auth context
  const {phoneNumber, userData: routeUserData} = route.params || {};
  const userData = routeUserData || authUserData;
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  
  // Validation states
  const [accountNumberError, setAccountNumberError] = useState('');
  const [ifscCodeError, setIfscCodeError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  
  // Location dropdown states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  // Pincode states
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  
  // Location states
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  

  
  // Get sorted states alphabetically
  const sortedStates = [...INDIA_STATES].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get filtered and sorted cities based on selection
  const filteredCities = selectedState 
    ? getCitiesByState(selectedState).sort((a, b) => a.name.localeCompare(b.name)) 
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
  
  // Show toast notification
  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
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
    setShowCityPicker(false);
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


  // Handle current location fetch with enhanced Realme/ColorOS device compatibility
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    
    try {
      // Step 1: Check if location services are enabled (critical for Realme/ColorOS)
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        showToast('Please enable Location Services in Settings → Privacy → Location Services', 'warning');
        setLocationLoading(false);
        return;
      }

      // Step 2: Check current permission status first
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      // Step 3: Request permissions if not granted
      let finalStatus = currentStatus;
      if (currentStatus !== 'granted') {
        const { status: requestedStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = requestedStatus;
      }
      
      if (finalStatus !== 'granted') {
        showToast('Location permission denied. Please enable in Settings → Apps → Permissions → Location', 'warning');
        setLocationLoading(false);
        return;
      }

      console.log('Location permissions granted, attempting to fetch location...');

      // Step 4: Try to get location - prioritize ANY cached location for Realme devices
      let location: Location.LocationObject | null = null;
      let usedLastKnown = false;
      
      // Strategy 1: Try to get ANY last known position (even very old)
      // This is most reliable on Realme devices with GPS issues
      try {
        console.log('Checking for any cached location...');
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 86400000, // Accept location up to 24 hours old
          requiredAccuracy: 100000, // Accept any accuracy (100km)
        });
        
        if (lastKnown && lastKnown.coords) {
          console.log('Found cached location:', {
            lat: lastKnown.coords.latitude,
            lng: lastKnown.coords.longitude,
            accuracy: lastKnown.coords.accuracy,
            timestamp: new Date(lastKnown.timestamp).toLocaleString(),
          });
          location = lastKnown;
          usedLastKnown = true;
        } else {
          console.log('No cached location available');
        }
      } catch (err) {
        console.log('Error getting cached location:', err);
      }

      // Strategy 2: Only try fresh GPS if no cached location exists
      // Use very short timeout since Realme GPS often doesn't work indoors
      if (!location) {
        console.log('No cached location found, attempting fresh GPS fix...');
        console.log('Note: This may fail indoors on Realme devices');
        
        try {
          // Single attempt with lowest accuracy and short timeout
          location = await Promise.race<Location.LocationObject>([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
              mayShowUserSettingsDialog: true,
              timeInterval: 10000,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('GPS timeout')), 20000)
            ),
          ]);

          if (location && location.coords) {
            console.log('Fresh GPS location obtained:', {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy,
            });
          }
        } catch (err: any) {
          console.log('Fresh GPS failed:', err.message || err);
          
          // Show helpful error message
          showToast(
            'GPS signal not available.\n\n' +
            'For Realme/ColorOS devices:\n' +
            '1. Go outdoors for better GPS signal\n' +
            '2. Open Google Maps first to activate GPS\n' +
            '3. Or enter address manually below',
            'error'
          );
          setLocationLoading(false);
          return;
        }
      }
      
      // Log which method was used
      if (usedLastKnown) {
        console.log('Using cached location (may not be current position)');
      }

      // Step 5: Validate location was obtained
      if (!location || !location.coords) {
        showToast('Location not available. Please enter address manually.', 'warning');
        setLocationLoading(false);
        return;
      }

      console.log('Attempting reverse geocoding...');

      // Step 6: Reverse geocode to get address with error handling
      let addressData;
      try {
        const geocodeResult = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        addressData = geocodeResult && geocodeResult.length > 0 ? geocodeResult[0] : null;
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        showToast('Location found but unable to get address details. Please enter manually.', 'warning');
        setLocationLoading(false);
        return;
      }

      // Step 7: Process and populate address fields
      if (addressData) {
        console.log('Address data received:', addressData);
        
        // Build address string from available components
        const addressParts = [];
        if (addressData.streetNumber) addressParts.push(addressData.streetNumber);
        if (addressData.street) addressParts.push(addressData.street);
        if (addressData.name && !addressData.street) addressParts.push(addressData.name);
        
        const addressLine = addressParts.join(' ').trim();
        if (addressLine) {
          setAddress(addressLine);
        }

        // Set sector/locality with multiple fallbacks
        const localityValue = addressData.subregion || 
                             addressData.district || 
                             addressData.city || 
                             addressData.region || 
                             '';
        if (localityValue) {
          setSector(localityValue);
        }

        // Set postal code and trigger auto-fill
        if (addressData.postalCode) {
          const cleanPostalCode = addressData.postalCode.replace(/\s/g, '');
          setPincode(cleanPostalCode);
          // Trigger pincode lookup to auto-fill state and city
          await handlePincodeChange(cleanPostalCode);
        }

        showToast('Location fetched successfully!', 'success');
      } else {
        showToast('Location found but address details unavailable. Please enter manually.', 'warning');
      }
      
    } catch (error: any) {
      console.error('Location error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to fetch location. Please enter address manually.';
      
      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        errorMessage = 'Location request timed out. Please ensure:\n• GPS is enabled\n• You have clear sky view\n• Try again in a moment';
      } else if (error.message?.includes('denied') || error.code === 'E_LOCATION_PERMISSIONS_DENIED') {
        errorMessage = 'Location permission denied. Enable in Settings → Apps → Permissions';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Location unavailable. Check:\n• GPS is enabled\n• Not in airplane mode\n• Location services are on';
      } else if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Location services disabled. Enable in device Settings';
      }
      
      showToast(errorMessage, 'error');
      
    } finally {
      setLocationLoading(false);
    }
  }, [handlePincodeChange]);
  
  // Memoize styles to prevent re-renders
  const titleStyle = useMemo(
    () => [styles.title, {color: theme.colors.text}],
    [theme.colors.text],
  );
  
  const subtitleStyle = useMemo(
    () => [styles.subtitle, {color: theme.colors.textSecondary}],
    [theme.colors.textSecondary],
  );

  // Step validation
  const isStep1Valid = useMemo(() => {
    return name.trim();
  }, [name]);

  const isStep2Valid = useMemo(() => {
    // Either bank details (Account Number + IFSC) OR UPI ID must be provided
    const hasBankDetails = isValidIndianAccountNumber(accountNumber) && isValidIndianIFSC(ifscCode);
    const hasUPI = isValidUPI(upiId);
    return hasBankDetails || hasUPI;
  }, [accountNumber, ifscCode, upiId]);

  const isStep3Valid = useMemo(() => {
    return address.trim() && pincode.length === 6 && !pincodeError && selectedState && selectedCity;
  }, [address, pincode, pincodeError, selectedState, selectedCity]);

  // Overall form validation
  const isFormValid = useMemo(() => {
    return isStep1Valid && isStep2Valid && isStep3Valid;
  }, [isStep1Valid, isStep2Valid, isStep3Valid]);

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  // Validation handlers
  const handleAccountNumberChange = (text: string) => {
    const formatted = formatAccountNumber(text);
    setAccountNumber(formatted);
    if (formatted.length > 0 && !isValidIndianAccountNumber(formatted)) {
      setAccountNumberError('Account number must be 9-18 digits');
    } else {
      setAccountNumberError('');
    }
  };

  const handleIFSCChange = (text: string) => {
    const formatted = formatIFSCCode(text);
    // Limit to 11 characters
    const limited = formatted.substring(0, 11);
    setIfscCode(limited);
    if (limited.length === 11 && !isValidIndianIFSC(limited)) {
      setIfscCodeError('Invalid IFSC format. Format: XXXX0XXXXX');
    } else if (limited.length > 0 && limited.length < 11) {
      setIfscCodeError('IFSC code must be 11 characters');
    } else {
      setIfscCodeError('');
    }
  };

  const handleUPIChange = (text: string) => {
    const formatted = formatUPIId(text);
    setUpiId(formatted);
    if (formatted.length > 0 && !isValidUPI(formatted)) {
      setUpiIdError('Invalid UPI format. Example: 9876543210@paytm');
    } else {
      setUpiIdError('');
    }
  };

  const handleComplete = async () => {
    // Validate: Either bank details OR UPI ID must be provided
    const isAccountValid = accountNumber.trim() ? isValidIndianAccountNumber(accountNumber) : true;
    const isIFSCValid = ifscCode.trim() ? isValidIndianIFSC(ifscCode) : true;
    const isUPIValid = upiId.trim() ? isValidUPI(upiId) : true;
    
    const hasBankDetails = isValidIndianAccountNumber(accountNumber) && isValidIndianIFSC(ifscCode);
    const hasUPI = isValidUPI(upiId);
    
    // Check if at least one payment method is provided
    if (!hasBankDetails && !hasUPI) {
      showToast('Please provide either Bank Account details OR UPI ID.', 'warning');
      setIsSubmitting(false);
      return;
    }
    
    // Validate individual fields if they are filled
    if (accountNumber.trim() && !isAccountValid) {
      setAccountNumberError('Account number must be 9-18 digits');
    }
    if (ifscCode.trim() && !isIFSCValid) {
      setIfscCodeError('Invalid IFSC format. Format: XXXX0XXXXX');
    }
    if (upiId.trim() && !isUPIValid) {
      setUpiIdError('Invalid UPI format. Example: 9876543210@paytm');
    }
    
    // If validation errors exist, stop submission
    if ((accountNumber.trim() && !isAccountValid) || 
        (ifscCode.trim() && !isIFSCValid) || 
        (upiId.trim() && !isUPIValid)) {
      setIsSubmitting(false);
      return;
    }
    
    if (
      name.trim() && 
      (hasBankDetails || hasUPI) &&
      address.trim() && 
      pincode.length === 6 &&
      selectedState && 
      selectedCity
    ) {
      setIsSubmitting(true);
      
      try {
        // Build formatted address: address, sector, city, state, pincode
        const addressParts = [
          address.trim(),
          sector.trim(),
          getCityName(selectedCity),
          getStateName(selectedState),
          pincode.trim(),
        ].filter(part => part && part.trim()); // Remove empty parts
        
        const formattedAddress = addressParts.join(', ');
        
        // Prepare and validate all parameters
        const userId = userData?.userid?.toString()?.trim() || '';
        // Get mobile number: first from userData, then from phoneNumber route param
        const mobileNumber = userData?.mobile?.trim() || formatIndianPhoneNumber(phoneNumber || '');
        const userName = name.trim();
        const acNo = accountNumber.replace(/\s/g, '').trim() || '';
        const ifsc = ifscCode.trim() || '';
        const upi = upiId.trim() || '';
        
        // Validate required fields are not empty
        if (!userId) {
          showToast('User ID is missing. Please try logging in again.', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!mobileNumber) {
          showToast('Mobile number is missing. Please try logging in again.', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!userName) {
          showToast('Please enter your name.', 'warning');
          setIsSubmitting(false);
          return;
        }
        // No need to check individual fields since we already validated either/or above
        if (!formattedAddress) {
          showToast('Please enter your address.', 'warning');
          setIsSubmitting(false);
          return;
        }
        
        // Call registration API
        const response = await registerUser({
          userid: userId,
          ac_no: acNo,
          ifsc_code: ifsc,
          upi_id: upi,
          mobile: mobileNumber,
          username: userName,
          address: formattedAddress,
          device_token: fcmToken || undefined,
        });
        
        if (response.status === 'success' || response.status_code === 200) {
          // Update userData with username, mobile, and set is_new to 'no' to mark profile as complete
          // This will trigger the navigator to show the Home screen
          const updatedUserData = {
            ...(userData || {}),
            username: userName,
            mobile: mobileNumber,
            is_new: 'no', // Mark profile as complete
            // Also update token if returned from API
            ...(response.userdata?.token && { token: response.userdata.token }),
            ...(response.userdata?.userid && { userid: response.userdata.userid }),
          };
          await login(updatedUserData);
          // Auth state change will automatically navigate to Home screen
        } else {
          showToast(response.message || 'Registration failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showToast('Failed to complete registration. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {paddingTop: insets.top + 20},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          removeClippedSubviews={false}
          overScrollMode="never"
          bounces={false}>
          <View style={styles.header}>
            <FallingRupees count={8} />
            <Text style={titleStyle}>Complete Your Profile</Text>
            <Text style={subtitleStyle}>Add your details to complete registration</Text>
          </View>

          {/* Progress Stepper */}
          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            {[1, 2, 3].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              
              const textColor = isCompleted || isActive ? '#000' : 'rgba(255, 255, 255, 0.6)';
              const backgroundColor = (isActive || isCompleted) 
                ? theme.colors.primary 
                : 'rgba(255, 255, 255, 0.2)';
              const borderColor = (isActive || isCompleted) 
                ? theme.colors.primary 
                : 'rgba(255, 255, 255, 0.3)';
              
              return (
                <React.Fragment key={step}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: backgroundColor,
                          borderColor: borderColor,
                          shadowColor: isActive ? theme.colors.primary : 'transparent',
                          shadowOffset: {width: 0, height: 2},
                          shadowOpacity: isActive ? 0.6 : 0,
                          shadowRadius: isActive ? 10 : 0,
                          elevation: isActive ? 6 : 0,
                        },
                      ]}>
                      {isCompleted ? (
                        <Icon name="check" size={20} color="#000" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNumber,
                            {color: textColor},
                          ]}>
                          {step}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color: (isActive || isCompleted) 
                            ? theme.colors.text 
                            : '#FFFFFF',
                          opacity: (isActive || isCompleted) ? 1 : 0.85,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}>
                      {step === 1
                        ? 'Personal'
                        : step === 2
                        ? 'Bank Details'
                        : 'Address'}
                    </Text>
                  </View>
                  {step < 3 && (
                    <View style={styles.stepConnector}>
                      <View
                        style={[
                          styles.stepConnectorFill,
                          {
                            backgroundColor: (currentStep > step) 
                              ? theme.colors.primary 
                              : 'rgba(255, 255, 255, 0.2)',
                            width: '100%',
                          },
                        ]}
                      />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.form}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                leftIcon={
                  <Icon
                    name="badge"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                }
              />
            )}

            {/* Step 2: Bank Details */}
            {currentStep === 2 && (
              <>
                <Text style={[styles.sectionHint, {color: theme.colors.textSecondary}]}>
                  Provide either Bank Account details OR UPI ID
                </Text>
                
                <Input
                  label="Account Number (Optional)"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  placeholder="Enter account number (9-18 digits)"
                  keyboardType="numeric"
                  error={accountNumberError}
                  leftIcon={
                    <Icon
                      name="account-balance"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  }
                  rightIcon={
                    accountNumber.length > 0 && isValidIndianAccountNumber(accountNumber) ? (
                      <Icon name="check-circle" size={20} color="#4CAF50" />
                    ) : null
                  }
                />

                <Input
                  label="IFSC Code (Optional)"
                  value={ifscCode}
                  onChangeText={handleIFSCChange}
                  placeholder="Enter IFSC (e.g., SBIN0001234)"
                  autoCapitalize="characters"
                  maxLength={11}
                  error={ifscCodeError}
                  leftIcon={
                    <Icon
                      name="code"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  }
                  rightIcon={
                    ifscCode.length === 11 && isValidIndianIFSC(ifscCode) ? (
                      <Icon name="check-circle" size={20} color="#4CAF50" />
                    ) : null
                  }
                />

                {/* OR Separator */}
                <View style={styles.orSeparator}>
                  <View style={styles.orLine} />
                  <Text style={[styles.orText, {color: theme.colors.textSecondary}]}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <Input
                  label="UPI ID (Optional)"
                  value={upiId}
                  onChangeText={handleUPIChange}
                  placeholder="Enter UPI ID (e.g., 9876543210@paytm)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={upiIdError}
                  leftIcon={
                    <Icon
                      name="payment"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  }
                  rightIcon={
                    upiId.length > 0 && isValidUPI(upiId) ? (
                      <Icon name="check-circle" size={20} color="#4CAF50" />
                    ) : null
                  }
                />
              </>
            )}

            {/* Step 3: Address Details */}
            {currentStep === 3 && (
              <>
                <Input
                  label="Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  maxLength={80}
                  leftIcon={
                    <Icon
                      name="location-on"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity 
                      onPress={getCurrentLocation}
                      disabled={locationLoading}
                      activeOpacity={0.7}>
                      {locationLoading ? (
                        <ActivityIndicator 
                          size="small" 
                          color={theme.colors.primary} 
                        />
                      ) : (
                        <Icon 
                          name="my-location" 
                          size={24} 
                          color={theme.colors.primary} 
                        />
                      )}
                    </TouchableOpacity>
                  }
                />
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
            <TouchableOpacity
              onPress={() => {
                setShowStatePicker(!showStatePicker);
                setShowCityPicker(false);
              }}
              activeOpacity={1}>
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
            </TouchableOpacity>

            {showStatePicker && (
              <View style={styles.pickerWrapper}>
                <View style={styles.pickerGlassContainer}>
                  <View style={styles.pickerGlassBaseLayer} />
                  <View style={styles.pickerGlassFrostLayer} />
                  <View style={styles.pickerGlassHighlight} />
                  <View style={styles.pickerGlassInnerBorder} />
                  <View style={styles.pickerGlassContent}>
                    <ScrollView 
                      style={styles.pickerScrollView} 
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}>
                      {sortedStates.map((state, index) => (
                        <TouchableOpacity
                          key={state.id}
                          activeOpacity={0.7}
                          style={[
                            styles.pickerItem,
                            selectedState === state.id && styles.pickerItemSelected,
                            index === sortedStates.length - 1 && styles.pickerItemLast,
                          ]}
                          onPress={() => handleStateChange(state.id)}>
                          <Text
                            style={[
                              styles.pickerText,
                              {
                                color: theme.colors.text,
                                fontWeight:
                                  selectedState === state.id ? '700' : '400',
                              },
                            ]}>
                            {state.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            {/* City Dropdown */}
            <TouchableOpacity
              onPress={() => {
                if (selectedState) {
                  setShowCityPicker(!showCityPicker);
                  setShowStatePicker(false);
                }
              }}
              activeOpacity={1}>
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
            </TouchableOpacity>

            {showCityPicker && filteredCities.length > 0 && (
              <View style={styles.pickerWrapper}>
                <View style={styles.pickerGlassContainer}>
                  <View style={styles.pickerGlassBaseLayer} />
                  <View style={styles.pickerGlassFrostLayer} />
                  <View style={styles.pickerGlassHighlight} />
                  <View style={styles.pickerGlassInnerBorder} />
                  <View style={styles.pickerGlassContent}>
                    <ScrollView 
                      style={styles.pickerScrollView} 
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}>
                      {filteredCities.map((city, index) => (
                        <TouchableOpacity
                          key={city.id}
                          activeOpacity={0.7}
                          style={[
                            styles.pickerItem,
                            selectedCity === city.id && styles.pickerItemSelected,
                            index === filteredCities.length - 1 && styles.pickerItemLast,
                          ]}
                          onPress={() => handleCityChange(city.id)}>
                          <Text
                            style={[
                              styles.pickerText,
                              {
                                color: theme.colors.text,
                                fontWeight:
                                  selectedCity === city.id ? '700' : '400',
                              },
                            ]}>
                            {city.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Navigation Buttons - Outside KeyboardAvoidingView to prevent flicker */}
      <View 
        style={[
          styles.bottomButtonContainer, 
          {paddingBottom: Math.max(insets.bottom, 20) + 8}
        ]}
        pointerEvents="box-none"
      >
        {currentStep > 1 ? (
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              handlePrevious();
            }}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.iconButtonPlaceholder} />}
        
        <View style={styles.buttonWrapper}>
          {currentStep < 3 ? (
            <Button
              title="Next"
              onPress={() => {
                Keyboard.dismiss();
                handleNext();
              }}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              }
              style={styles.button}
            />
          ) : (
            <Button
              title={isSubmitting ? "Registering..." : "Complete Registration"}
              onPress={() => {
                Keyboard.dismiss();
                handleComplete();
              }}
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              style={styles.button}
            />
          )}
        </View>
      </View>
      
      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'visible',
    zIndex: 1,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  imageContentWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
  },
  editIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    color: '#FFFFFF',
  },
  stepConnector: {
    width: 40,
    height: 3,
    marginHorizontal: 8,
    marginBottom: 34,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  stepConnectorFill: {
    height: '100%',
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    // Prevent layout thrashing on Android
    elevation: 8,
    zIndex: 999,
  },
  iconButtonPlaceholder: {
    width: 56,
    height: 56,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    height: 56,
    width: 0,
  },
  backButton: {
    gap: 8,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonWrapper: {
    flex: 1,
    width: 0,
  },
  button: {
    marginTop: 0,
    width: '100%',
    height: 56,
    minHeight: 56,
  },
  pickerWrapper: {
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'visible',
    zIndex: 1000,
  },
  pickerGlassContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
    maxHeight: 250,
  },
  pickerGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  pickerGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  pickerGlassHighlight: {
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
  pickerGlassInnerBorder: {
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
  pickerGlassContent: {
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pickerScrollView: {
    maxHeight: 250,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  pickerItemLast: {
    borderBottomWidth: 0,
  },
  pickerText: {
    fontSize: 16,
  },
  sectionHint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    opacity: 0.8,
  },
});
