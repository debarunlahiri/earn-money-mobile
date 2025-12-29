import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useScrollVisibility} from '../context/ScrollVisibilityContext';
import {FallingRupees} from '../components/FallingRupee';

interface WalletScreenProps {
  navigation: any;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const {handleScroll, headerTranslateY} = useScrollVisibility();

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
      <Animated.View
        style={[
          styles.header,
          {
            top: insets.top,
            paddingTop: 20,
            transform: [{translateY: headerTranslateY}],
          },
        ]}>
        <FallingRupees count={12} />
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          My Wallet
        </Text>
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingTop: insets.top + 100},
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}>

        <View style={styles.balanceCard}>
          <View style={styles.glassContainer}>
            <View style={styles.glassBaseLayer} />
            <View style={styles.glassFrostLayer} />
            <View style={styles.glassHighlight} />
            <View style={styles.glassInnerBorder} />
            <View style={styles.glassContent}>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, {color: theme.colors.text}]}>
              Available Balance:
            </Text>
            <View style={styles.balanceValueContainer}>
              <Icon name="currency-rupee" size={20} color={theme.colors.primary} />
              <Text style={[styles.balanceValue, {color: theme.colors.primary}]}>
                18,500
              </Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: 'rgba(212, 175, 55, 0.2)'}]} />

          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, {color: theme.colors.text}]}>
              Pending Earnings:
            </Text>
            <View style={styles.balanceValueContainer}>
              <Icon name="currency-rupee" size={20} color={theme.colors.primary} />
              <Text style={[styles.balanceValue, {color: theme.colors.primary}]}>
                5,000
              </Text>
            </View>
          </View>

          <View style={[styles.divider, {backgroundColor: 'rgba(212, 175, 55, 0.2)'}]} />

          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, {color: theme.colors.text}]}>
              Total Earned:
            </Text>
            <View style={styles.balanceValueContainer}>
              <Icon name="currency-rupee" size={20} color={theme.colors.primary} />
              <Text style={[styles.balanceValue, {color: theme.colors.primary}]}>
                45,000
              </Text>
            </View>
            </View>
          </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonGlassContainer}>
            <View style={styles.buttonGlassBaseLayer} />
            <View style={styles.buttonGlassFrostLayer} />
            <View style={styles.buttonGlassHighlight} />
            <View style={styles.buttonGlassInnerBorder} />
        <TouchableOpacity
              style={styles.buttonGlassContent}
          onPress={() => navigation.navigate('WithdrawMoney')}>
          <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
        </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historyButtonContainer}>
          <View style={styles.historyButtonGlassContainer}>
            <View style={styles.historyButtonGlassBaseLayer} />
            <View style={styles.historyButtonGlassFrostLayer} />
            <View style={styles.historyButtonGlassHighlight} />
            <View style={styles.historyButtonGlassInnerBorder} />
        <TouchableOpacity
              style={styles.historyButtonGlassContent}
          onPress={() => navigation.navigate('TransactionHistory')}>
          <Text style={[styles.historyButtonText, {color: theme.colors.text}]}>
            Transaction History
          </Text>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 20,
  },
  balanceCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'visible',
  },
  glassContainer: {
    borderRadius: 20,
    overflow: 'visible',
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
  glassHighlight: {
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
  glassInnerBorder: {
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
  glassContent: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'visible',
  },
  buttonGlassContainer: {
    borderRadius: 16,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  buttonGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    pointerEvents: 'none',
  },
  buttonGlassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 15.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  buttonGlassContent: {
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  withdrawButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  historyButtonContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'visible',
  },
  historyButtonGlassContainer: {
    borderRadius: 16,
    overflow: 'visible',
    backgroundColor: 'rgba(139, 69, 19, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    position: 'relative',
  },
  historyButtonGlassBaseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.12)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  historyButtonGlassFrostLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  historyButtonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    pointerEvents: 'none',
  },
  historyButtonGlassInnerBorder: {
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 15.5,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
  },
  historyButtonGlassContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

