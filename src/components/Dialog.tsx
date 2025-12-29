import React, {useRef, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import LottieView from 'lottie-react-native';

interface DialogProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning' | 'logout';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
}) => {
  const {theme} = useTheme();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    }
  }, [visible]);

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return theme.colors.error || '#F44336';
      case 'warning':
        return '#FF9800';
      case 'logout':
        return '#FF5050';
      default:
        return theme.colors.primary;
    }
  };

  const getLottieSource = () => {
    switch (type) {
      case 'success':
        return require('../../assets/animations/Success.json');
      case 'error':
        return require('../../assets/animations/error.json');
      case 'logout':
        return require('../../assets/animations/Bye-bye.json');
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const lottieSource = getLottieSource();
  const showAnimation = lottieSource !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.surface,
            },
          ]}>
          {showAnimation && (
            <View style={styles.animationContainer}>
              <LottieView
                ref={animationRef}
                source={lottieSource}
                autoPlay
                loop={type === 'logout'}
                style={styles.animation}
              />
            </View>
          )}

          {title ? (
            <Text
              style={[
                styles.title,
                {color: theme.colors.text},
                showAnimation && styles.titleCentered,
              ]}>
              {title}
            </Text>
          ) : null}

          <Text
            style={[
              styles.message,
              {color: theme.colors.text},
              showAnimation && styles.messageCentered,
            ]}>
            {message}
          </Text>

          <View style={[styles.buttonContainer, showAnimation && styles.buttonContainerCentered]}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    borderColor: theme.colors.border,
                    marginRight: 12,
                  },
                ]}
                onPress={onClose}>
                <Text
                  style={[styles.cancelButtonText, {color: theme.colors.text}]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: getIconColor(),
                },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}>
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  animationContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  titleCentered: {
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  messageCentered: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
  buttonContainerCentered: {
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
