import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

interface RegisterDetailsScreenProps {
  navigation: any;
  route: any;
}

export const RegisterDetailsScreen: React.FC<RegisterDetailsScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImagePicker = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleComplete = () => {
    if (name.trim()) {
      navigation.replace('Home');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Add your name and profile picture
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.imageContainer}>
            <View
              style={[
                styles.imagePicker,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View style={styles.imageContentWrapper}>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                  style={styles.imageTouchable}>
                  {profileImage ? (
                    <Image
                      source={{uri: profileImage}}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Icon
                        name="camera-alt"
                        size={48}
                        color={theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.placeholderText,
                          {color: theme.colors.textSecondary},
                        ]}>
                        Add Photo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.editIcon,
                  {backgroundColor: theme.colors.primary},
                ]}
                onPress={handleImagePicker}
                activeOpacity={0.8}>
                <Icon name="edit" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            leftIcon={
              <Icon
                name="person"
                size={20}
                color={theme.colors.textSecondary}
              />
            }
          />

          <Button
            title="Complete Registration"
            onPress={handleComplete}
            disabled={!name.trim()}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 8,
  },
});
