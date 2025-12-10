import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import {PropertyFormData} from '../types';

interface PropertyFormScreenProps {
  navigation: any;
  route: any;
}

const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Commercial'];
const propertyStatuses = ['Available', 'Under Construction', 'Sold', 'Rented'];
const amenities = [
  'Parking',
  'Gym',
  'Swimming Pool',
  'Security',
  'Elevator',
  'Garden',
  'Balcony',
  'WiFi',
];

const features = [
  'Furnished',
  'Semi-Furnished',
  'Unfurnished',
  'Air Conditioning',
  'Heating',
  'Fireplace',
  'Dishwasher',
  'Washing Machine',
];

export const PropertyFormScreen: React.FC<PropertyFormScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const {enquiryType} = route.params;
  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: '',
    propertyName: '',
    propertyDescription: '',
    propertyImage: null,
    propertyPrice: '',
    propertyLocation: '',
    propertyArea: '',
    propertyStatus: '',
    propertyAmenities: [],
    propertyFeatures: [],
    propertyDocuments: [],
    enquiryType: enquiryType,
  });

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleImagePicker = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({...formData, propertyImage: result.assets[0].uri});
    }
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.propertyAmenities;
    if (currentAmenities.includes(amenity)) {
      setFormData({
        ...formData,
        propertyAmenities: currentAmenities.filter(a => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        propertyAmenities: [...currentAmenities, amenity],
      });
    }
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.propertyFeatures;
    if (currentFeatures.includes(feature)) {
      setFormData({
        ...formData,
        propertyFeatures: currentFeatures.filter(f => f !== feature),
      });
    } else {
      setFormData({
        ...formData,
        propertyFeatures: [...currentFeatures, feature],
      });
    }
  };

  const handleSubmit = () => {
    if (
      formData.propertyType &&
      formData.propertyName &&
      formData.propertyDescription &&
      formData.propertyPrice &&
      formData.propertyLocation &&
      formData.propertyArea
    ) {
      Alert.alert('Success', 'Property enquiry created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
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
          Property Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.imageSection}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Property Image
            </Text>
            <TouchableOpacity
              style={[
                styles.imagePicker,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={handleImagePicker}>
              {formData.propertyImage ? (
                <Image
                  source={{uri: formData.propertyImage}}
                  style={styles.propertyImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon
                    name="add-photo-alternate"
                    size={48}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.imagePlaceholderText,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Add Image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Property Type *"
            value={formData.propertyType}
            placeholder="Select property type"
            editable={false}
            onFocus={() => setShowTypePicker(true)}
            leftIcon={
              <Icon name="home" size={20} color={theme.colors.textSecondary} />
            }
            rightIcon={
              <Icon
                name="arrow-drop-down"
                size={24}
                color={theme.colors.textSecondary}
              />
            }
          />

          {showTypePicker && (
            <View
              style={[
                styles.pickerContainer,
                {backgroundColor: theme.colors.surface},
              ]}>
              {propertyTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor:
                        formData.propertyType === type
                          ? theme.colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setFormData({...formData, propertyType: type});
                    setShowTypePicker(false);
                  }}>
                  <Text style={[styles.pickerText, {color: theme.colors.text}]}>
                    {type}
                  </Text>
                  {formData.propertyType === type && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Input
            label="Property Name *"
            value={formData.propertyName}
            onChangeText={text =>
              setFormData({...formData, propertyName: text})
            }
            placeholder="Enter property name"
            leftIcon={
              <Icon name="title" size={20} color={theme.colors.textSecondary} />
            }
          />

          <View style={styles.textAreaContainer}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Property Description *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={formData.propertyDescription}
              onChangeText={text =>
                setFormData({...formData, propertyDescription: text})
              }
              placeholder="Enter property description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <Input
            label="Price *"
            value={formData.propertyPrice}
            onChangeText={text =>
              setFormData({...formData, propertyPrice: text})
            }
            placeholder="Enter price"
            keyboardType="numeric"
            leftIcon={
              <Icon
                name="attach-money"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Input
            label="Location *"
            value={formData.propertyLocation}
            onChangeText={text =>
              setFormData({...formData, propertyLocation: text})
            }
            placeholder="Enter location"
            leftIcon={
              <Icon
                name="location-on"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Input
            label="Area *"
            value={formData.propertyArea}
            onChangeText={text =>
              setFormData({...formData, propertyArea: text})
            }
            placeholder="Enter area (sq ft)"
            keyboardType="numeric"
            leftIcon={
              <Icon
                name="square-foot"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Input
            label="Status"
            value={formData.propertyStatus}
            placeholder="Select status"
            editable={false}
            onFocus={() => setShowStatusPicker(true)}
            leftIcon={
              <Icon name="info" size={20} color={theme.colors.textSecondary} />
            }
            rightIcon={
              <Icon
                name="arrow-drop-down"
                size={24}
                color={theme.colors.textSecondary}
              />
            }
          />

          {showStatusPicker && (
            <View
              style={[
                styles.pickerContainer,
                {backgroundColor: theme.colors.surface},
              ]}>
              {propertyStatuses.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor:
                        formData.propertyStatus === status
                          ? theme.colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setFormData({...formData, propertyStatus: status});
                    setShowStatusPicker(false);
                  }}>
                  <Text style={[styles.pickerText, {color: theme.colors.text}]}>
                    {status}
                  </Text>
                  {formData.propertyStatus === status && (
                    <Icon name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Amenities
            </Text>
            <View style={styles.chipContainer}>
              {amenities.map(amenity => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: formData.propertyAmenities.includes(
                        amenity,
                      )
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleAmenity(amenity)}>
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: formData.propertyAmenities.includes(amenity)
                          ? '#FFFFFF'
                          : theme.colors.text,
                      },
                    ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Features
            </Text>
            <View style={styles.chipContainer}>
              {features.map(feature => (
                <TouchableOpacity
                  key={feature}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: formData.propertyFeatures.includes(
                        feature,
                      )
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleFeature(feature)}>
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: formData.propertyFeatures.includes(feature)
                          ? '#FFFFFF'
                          : theme.colors.text,
                      },
                    ]}>
                    {feature}
                  </Text>
                </TouchableOpacity>
              ))}
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
    padding: 16,
    paddingBottom: 32,
  },
  form: {
    gap: 16,
  },
  imageSection: {
    marginBottom: 8,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerText: {
    fontSize: 16,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 24,
  },
});
