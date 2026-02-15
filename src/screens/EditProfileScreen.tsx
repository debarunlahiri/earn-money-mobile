import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FallingRupees } from '../components/FallingRupee';
import { updateProfile, getProfile, ProfileData } from '../services/api';
import { getCachedExpoPushToken } from '../services/notificationService';
import { INDIA_STATES } from '../data/indiaStates';
import { INDIA_CITIES, getCitiesByState } from '../data/indiaCities';
import {
  isValidIndianAccountNumber,
  isValidIndianIFSC,
  isValidUPI,
} from '../utils/phoneUtils';
import { Toast, ToastType } from '../components/Toast';
import * as Location from 'expo-location';

interface EditProfileScreenProps {
  navigation: any;
  route: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const routeProfileData = route.params?.profileData;

  // Loading state for fetching profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(routeProfileData || null);

  // Helper to parse combined address string into separate fields
  const parseAddress = useCallback((rawAddress: string) => {
    const parts = rawAddress.split(',').map((p: string) => p.trim()).filter(Boolean);
    let addr = '';
    let sec = '';
    let pin = '';
    let stateId = '';
    let cityId = '';

    // Extract pincode (6-digit number)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d{6}$/.test(parts[i])) {
        pin = parts[i];
        parts.splice(i, 1);
        break;
      }
    }

    // Extract state
    for (let i = parts.length - 1; i >= 0; i--) {
      const matchedState = INDIA_STATES.find(
        s => s.name.toLowerCase() === parts[i].toLowerCase(),
      );
      if (matchedState) {
        stateId = matchedState.id;
        parts.splice(i, 1);
        break;
      }
    }

    // Extract city based on matched state
    if (stateId) {
      const citiesInState = getCitiesByState(stateId);
      for (let i = parts.length - 1; i >= 0; i--) {
        const matchedCity = citiesInState.find(
          c => c.name.toLowerCase() === parts[i].toLowerCase(),
        );
        if (matchedCity) {
          cityId = matchedCity.id;
          parts.splice(i, 1);
          break;
        }
      }
    }

    // Remaining parts: first is address, second (if any) is sector
    if (parts.length >= 2) {
      addr = parts[0];
      sec = parts.slice(1).join(', ');
    } else if (parts.length === 1) {
      addr = parts[0];
    }

    return { addr, sec, pin, stateId, cityId };
  }, []);

  // Form states
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [pincode, setPincode] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'upi'>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  // Fetch fresh profile data from API on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        const userId = userData?.userid || routeProfileData?.userid;
        const token = userData?.token || routeProfileData?.token;

        if (!userId || !token) {
          // Fallback to route params if no auth data
          if (routeProfileData) {
            setProfileData(routeProfileData);
          }
          setIsLoadingProfile(false);
          return;
        }

        const expoToken = await getCachedExpoPushToken();
        const response = await getProfile(userId, token, expoToken || undefined);

        if (response.status === 'success' && response.status_code === 200 && response.userdata) {
          console.log('EditProfile: Fresh profile data loaded:', JSON.stringify(response.userdata));
          setProfileData(response.userdata);
        } else if (routeProfileData) {
          // Fallback to route param data
          setProfileData(routeProfileData);
        }
      } catch (error) {
        console.error('EditProfile: Error fetching profile:', error);
        // Fallback to route param data
        if (routeProfileData) {
          setProfileData(routeProfileData);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);

  // Populate form fields when profileData is loaded
  useEffect(() => {
    if (!profileData) return;

    console.log('EditProfile: Populating fields from profileData:', {
      username: profileData.username,
      address: profileData.address,
      ac_no: profileData.ac_no,
      ifsc_code: profileData.ifsc_code,
      upi_id: profileData.upi_id,
    });

    // Set simple fields
    setUsername(profileData.username || '');
    setAccountNumber(profileData.ac_no || '');
    setIfscCode(profileData.ifsc_code || '');
    setUpiId(profileData.upi_id || '');

    // Set payment method based on existing data
    if (profileData.upi_id && !profileData.ac_no) {
      setPaymentMethod('upi');
    } else {
      setPaymentMethod('bank');
    }

    // Parse and set address fields
    if (profileData.address) {
      const parsed = parseAddress(profileData.address);
      console.log('EditProfile: Parsed address:', parsed);
      setAddress(parsed.addr);
      setSector(parsed.sec);
      setPincode(parsed.pin);
      setSelectedState(parsed.stateId);
      setSelectedCity(parsed.cityId);
    }
  }, [profileData, parseAddress]);

  // Validation states
  const [accountNumberError, setAccountNumberError] = useState('');
  const [ifscCodeError, setIfscCodeError] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const sortedStates = useMemo(
    () => [...INDIA_STATES].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const filteredCities = useMemo(
    () =>
      selectedState
        ? getCitiesByState(selectedState).sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [selectedState],
  );

  const getStateName = (stateId: string) => {
    const state = INDIA_STATES.find(s => s.id === stateId);
    return state ? state.name : '';
  };

  const getCityName = (cityId: string) => {
    const city = INDIA_CITIES.find(c => c.id === cityId);
    return city ? city.name : '';
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setShowStatePicker(false);
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setShowCityPicker(false);
  };

  const handlePincodeChange = useCallback(async (text: string) => {
    const cleanedPincode = text.replace(/\D/g, '').substring(0, 6);
    setPincode(cleanedPincode);
    setPincodeError('');

    if (cleanedPincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${cleanedPincode}`,
        );
        const data = await response.json();

        if (
          data &&
          data[0] &&
          data[0].Status === 'Success' &&
          data[0].PostOffice &&
          data[0].PostOffice.length > 0
        ) {
          const postOffice = data[0].PostOffice[0];
          const stateName = postOffice.State;
          const districtName = postOffice.District;

          if (postOffice.Name) {
            setSector(postOffice.Name);
          }

          const matchedState = INDIA_STATES.find(
            s => s.name.toLowerCase() === stateName.toLowerCase(),
          );

          if (matchedState) {
            setSelectedState(matchedState.id);
            const citiesInState = getCitiesByState(matchedState.id);
            const matchedCity = citiesInState.find(
              c => c.name.toLowerCase() === districtName.toLowerCase(),
            );
            if (matchedCity) {
              setSelectedCity(matchedCity.id);
            }
          }
        } else {
          setPincodeError('Invalid pincode');
        }
      } catch (error) {
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

      // Strategy 2: Try fresh location with multiple accuracy levels
      if (!location) {
        console.log('No cached location found, attempting fresh location fix...');

        const accuracyLevels = [
          { accuracy: Location.Accuracy.Low, label: 'Network/Low', timeout: 10000 },
          { accuracy: Location.Accuracy.Lowest, label: 'Lowest', timeout: 15000 },
          { accuracy: Location.Accuracy.Balanced, label: 'Balanced', timeout: 20000 },
        ];

        for (const level of accuracyLevels) {
          try {
            console.log(`Trying ${level.label} accuracy (${level.timeout / 1000}s timeout)...`);
            location = await Promise.race<Location.LocationObject>([
              Location.getCurrentPositionAsync({
                accuracy: level.accuracy,
                mayShowUserSettingsDialog: true,
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('GPS timeout')), level.timeout)
              ),
            ]);

            if (location && location.coords) {
              console.log(`Location obtained via ${level.label}:`, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                accuracy: location.coords.accuracy,
              });
              break;
            }
          } catch (err: any) {
            console.log(`${level.label} attempt failed:`, err.message || err);
          }
        }

        if (!location) {
          showToast(
            'GPS signal not available. Tips:\n' +
            '• Go outdoors for better signal\n' +
            '• Open Google Maps first to warm up GPS\n' +
            '• Or enter address manually',
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

  // Handlers
  const handleAccountNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAccountNumber(cleaned);
    if (cleaned.length > 0 && !isValidIndianAccountNumber(cleaned)) {
      setAccountNumberError('Account number must be 9-18 digits');
    } else {
      setAccountNumberError('');
    }
  };

  const handleIFSCChange = (text: string) => {
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 11);
    setIfscCode(formatted);
    if (formatted.length > 0 && formatted.length === 11 && !isValidIndianIFSC(formatted)) {
      setIfscCodeError('Invalid IFSC code format');
    } else {
      setIfscCodeError('');
    }
  };

  const handleUPIChange = (text: string) => {
    const formatted = text.toLowerCase().trim();
    setUpiId(formatted);
    if (formatted.length > 0 && !isValidUPI(formatted)) {
      setUpiIdError('Invalid UPI ID (e.g., name@paytm)');
    } else {
      setUpiIdError('');
    }
  };

  // Validation
  const isFormValid = useMemo(() => {
    if (!username.trim()) return false;
    if (!address.trim()) return false;
    if (pincode.length !== 6 || !!pincodeError) return false;
    if (!selectedState || !selectedCity) return false;

    // Payment is mandatory - validate based on selected method
    if (paymentMethod === 'bank') {
      if (!isValidIndianAccountNumber(accountNumber) || !isValidIndianIFSC(ifscCode)) {
        return false;
      }
    } else {
      if (!isValidUPI(upiId)) {
        return false;
      }
    }

    return true;
  }, [
    username,
    address,
    pincode,
    pincodeError,
    selectedState,
    selectedCity,
    paymentMethod,
    accountNumber,
    ifscCode,
    upiId,
  ]);

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!username.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }
    if (!address.trim()) {
      showToast('Please enter your address.', 'warning');
      return;
    }
    if (pincode.length !== 6 || pincodeError) {
      showToast('Please enter a valid 6-digit pincode.', 'warning');
      return;
    }
    if (!selectedState || !selectedCity) {
      showToast('Please select state and city.', 'warning');
      return;
    }

    // Validate payment details (mandatory)
    if (paymentMethod === 'bank') {
      if (!isValidIndianAccountNumber(accountNumber)) {
        showToast('Please enter a valid account number (9-18 digits).', 'warning');
        return;
      }
      if (!isValidIndianIFSC(ifscCode)) {
        showToast('Please enter a valid IFSC code.', 'warning');
        return;
      }
    } else {
      if (!isValidUPI(upiId)) {
        showToast('Please enter a valid UPI ID.', 'warning');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formattedAddress = [
        address.trim(),
        sector.trim(),
        getCityName(selectedCity),
        getStateName(selectedState),
        pincode.trim(),
      ]
        .filter(part => part && part.trim())
        .join(', ');

      const response = await updateProfile(
        userData?.userid || profileData?.userid || 0,
        userData?.token || profileData?.token || 0,
        username.trim(),
        ifscCode.trim(),
        upiId.trim(),
        accountNumber.trim(),
        formattedAddress,
      );

      if (response.status === 'success' || response.status_code === 200) {
        showToast('Profile updated successfully!', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else {
        showToast(response.message || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg_image_second.png')}
      style={styles.container}
      resizeMode="cover">
      <View style={styles.overlay} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <FallingRupees count={6} />
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Edit Profile
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">

          {isLoadingProfile ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading profile...
              </Text>
            </View>
          ) : (
            <>
              {/* Personal Info Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionGlass}>
                  <View style={styles.glassBaseLayer} />
                  <View style={styles.glassFrostLayer} />
                  <View style={styles.glassContent}>
                    <View style={styles.sectionHeader}>
                      <Icon name="person" size={20} color={theme.colors.primary} />
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Personal Information
                      </Text>
                    </View>

                    <Input
                      label="Full Name *"
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter your full name"
                      autoCapitalize="words"
                      leftIcon={
                        <Icon name="badge" size={20} color={theme.colors.textSecondary} />
                      }
                    />

                  </View>
                </View>
              </View>

              {/* Address Section (same pattern as RegisterDetails) */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionGlass}>
                  <View style={styles.glassBaseLayer} />
                  <View style={styles.glassFrostLayer} />
                  <View style={styles.glassContent}>
                    <View style={styles.sectionHeader}>
                      <Icon name="location-on" size={20} color={theme.colors.primary} />
                      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Address</Text>
                    </View>

                    <Input
                      label="Address *"
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter your address"
                      maxLength={80}
                      leftIcon={<Icon name="location-on" size={20} color={theme.colors.textSecondary} />}
                      rightIcon={
                        <TouchableOpacity
                          onPress={getCurrentLocation}
                          disabled={locationLoading}
                          activeOpacity={0.7}>
                          {locationLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                          ) : (
                            <Icon name="my-location" size={24} color={theme.colors.primary} />
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
                      leftIcon={<Icon name="pin-drop" size={20} color={theme.colors.textSecondary} />}
                      rightIcon={
                        pincodeLoading ? (
                          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Loading...</Text>
                        ) : pincode.length === 6 && !pincodeError ? (
                          <Icon name="check-circle" size={20} color="#4CAF50" />
                        ) : null
                      }
                    />

                    <Input
                      label="Sector/Locality"
                      value={sector}
                      onChangeText={setSector}
                      placeholder="Enter sector/locality (optional)"
                      leftIcon={<Icon name="apartment" size={20} color={theme.colors.textSecondary} />}
                    />

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
                        leftIcon={<Icon name="map" size={20} color={theme.colors.textSecondary} />}
                        rightIcon={<Icon name="arrow-drop-down" size={24} color={theme.colors.textSecondary} />}
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
                                        fontWeight: selectedState === state.id ? '700' : '400',
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
                        placeholder={selectedState ? 'Select city' : 'Select state first'}
                        editable={false}
                        pointerEvents="none"
                        leftIcon={<Icon name="location-city" size={20} color={theme.colors.textSecondary} />}
                        rightIcon={<Icon name="arrow-drop-down" size={24} color={theme.colors.textSecondary} />}
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
                                        fontWeight: selectedCity === city.id ? '700' : '400',
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
                  </View>
                </View>
              </View>

              {/* Payment Details Section - Either Bank OR UPI */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionGlass}>
                  <View style={styles.glassBaseLayer} />
                  <View style={styles.glassFrostLayer} />
                  <View style={styles.glassContent}>
                    <View style={styles.sectionHeader}>
                      <Icon name="payment" size={20} color={theme.colors.primary} />
                      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                        Payment Details *
                      </Text>
                    </View>

                    {/* Toggle Tabs */}
                    <View style={styles.paymentToggle}>
                      <TouchableOpacity
                        style={[
                          styles.paymentTab,
                          paymentMethod === 'bank' && styles.paymentTabActive,
                        ]}
                        onPress={() => {
                          setPaymentMethod('bank');
                          setUpiId('');
                          setUpiIdError('');
                        }}
                        activeOpacity={0.7}>
                        <Icon
                          name="account-balance"
                          size={16}
                          color={paymentMethod === 'bank' ? '#000' : 'rgba(255,255,255,0.5)'}
                        />
                        <Text
                          style={[
                            styles.paymentTabText,
                            {color: paymentMethod === 'bank' ? '#000' : 'rgba(255,255,255,0.5)'},
                          ]}>
                          Bank Account
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.paymentTab,
                          paymentMethod === 'upi' && styles.paymentTabActive,
                        ]}
                        onPress={() => {
                          setPaymentMethod('upi');
                          setAccountNumber('');
                          setIfscCode('');
                          setAccountNumberError('');
                          setIfscCodeError('');
                        }}
                        activeOpacity={0.7}>
                        <Icon
                          name="smartphone"
                          size={16}
                          color={paymentMethod === 'upi' ? '#000' : 'rgba(255,255,255,0.5)'}
                        />
                        <Text
                          style={[
                            styles.paymentTabText,
                            {color: paymentMethod === 'upi' ? '#000' : 'rgba(255,255,255,0.5)'},
                          ]}>
                          UPI ID
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {paymentMethod === 'bank' ? (
                      <>
                        <Text style={[styles.sectionHint, {color: theme.colors.textSecondary}]}>
                          If you add account number, IFSC code is mandatory
                        </Text>

                        <Input
                          label="Account Number"
                          value={accountNumber}
                          onChangeText={handleAccountNumberChange}
                          placeholder="Enter bank account number"
                          keyboardType="numeric"
                          maxLength={18}
                          error={accountNumberError}
                          leftIcon={
                            <Icon name="credit-card" size={20} color={theme.colors.textSecondary} />
                          }
                          rightIcon={
                            accountNumber.length > 0 && isValidIndianAccountNumber(accountNumber) ? (
                              <Icon name="check-circle" size={20} color="#4CAF50" />
                            ) : null
                          }
                        />

                        <Input
                          label={accountNumber.trim().length > 0 ? 'IFSC Code *' : 'IFSC Code'}
                          value={ifscCode}
                          onChangeText={handleIFSCChange}
                          placeholder="Enter IFSC code (e.g., SBIN0001234)"
                          autoCapitalize="characters"
                          maxLength={11}
                          error={ifscCodeError}
                          leftIcon={
                            <Icon name="code" size={20} color={theme.colors.textSecondary} />
                          }
                          rightIcon={
                            ifscCode.length === 11 && isValidIndianIFSC(ifscCode) ? (
                              <Icon name="check-circle" size={20} color="#4CAF50" />
                            ) : null
                          }
                        />
                      </>
                    ) : (
                      <Input
                        label="UPI ID"
                        value={upiId}
                        onChangeText={handleUPIChange}
                        placeholder="Enter UPI ID (e.g., name@paytm)"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        error={upiIdError}
                        leftIcon={
                          <Icon name="smartphone" size={20} color={theme.colors.textSecondary} />
                        }
                        rightIcon={
                          upiId.length > 0 && isValidUPI(upiId) ? (
                            <Icon name="check-circle" size={20} color="#4CAF50" />
                          ) : null
                        }
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Save Button */}
              <View style={styles.buttonContainer}>
                <Button
                  title={isSubmitting ? 'Saving...' : 'Save Changes'}
                  onPress={handleSave}
                  disabled={!isFormValid || isSubmitting}
                  loading={isSubmitting}
                  style={styles.saveButton}
                />
              </View>

              <View style={{ height: 40 }} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionGlass: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  glassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  glassContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  optionalBadge: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  paymentToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    marginBottom: 16,
    padding: 3,
    gap: 4,
  },
  paymentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  paymentTabActive: {
    backgroundColor: '#D4AF37',
  },
  paymentTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 16,
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
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    paddingHorizontal: 18,
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
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
