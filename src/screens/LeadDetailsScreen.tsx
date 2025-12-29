import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Lead} from '../services/api';

interface LeadDetailsScreenProps {
  navigation?: any;
  route?: {
    params: {
      lead: Lead;
    };
  };
}

export const LeadDetailsScreen: React.FC<LeadDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {lead} = route!.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hour12}:${minutes} ${ampm}`;
  };

  const handleCall = () => {
    Linking.openURL(`tel:${lead.mobile}`);
  };

  const handleWhatsApp = () => {
    const message = `Hello ${lead.name}, I am contacting you regarding your enquiry.`;
    const url = `whatsapp://send?phone=91${lead.mobile}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/91${lead.mobile}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: '#121212'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={[styles.header, {paddingTop: insets.top + 10}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Lead Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.idSection}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>Lead #{lead.id}</Text>
          </View>
          <Text style={styles.dateCreated}>
            Created: {formatDate(lead.created_at)}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Contact Information</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{lead.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Mobile Number</Text>
            <Text style={styles.value}>{lead.mobile}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-on" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Address</Text>
          </View>

          <Text style={styles.addressText}>{lead.address}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="description" size={24} color="#D4AF37" />
            <Text style={styles.cardTitle}>Requirement</Text>
          </View>

          <Text style={styles.requirementText}>{lead.requirement}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCall}>
            <Icon name="phone" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={handleWhatsApp}>
            <Icon name="chat" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  idSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  idBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  idText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  dateCreated: {
    fontSize: 12,
    color: '#888',
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  addressText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  requirementText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
