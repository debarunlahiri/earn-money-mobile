import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {useTheme} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {ForwardLeadListItem, Lead, viewLeads} from '../services/api';

interface ForwardLeadRouteItem extends ForwardLeadListItem {
  id: string;
}

interface ForwardLeadDetailsScreenProps {
  navigation?: any;
  route?: {
    params?: {
      forwardLead: ForwardLeadRouteItem;
    };
  };
}

export const ForwardLeadDetailsScreen: React.FC<ForwardLeadDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const forwardLead = route?.params?.forwardLead;

  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(true);

  const fetchLeadDetails = useCallback(async () => {
    if (!forwardLead?.lead_id || !userData?.userid || !userData?.token) {
      setIsLoadingLead(false);
      return;
    }

    try {
      setIsLoadingLead(true);
      const response = await viewLeads(userData.userid, userData.token);

      if (response.status === 'success' && Array.isArray(response.data)) {
        const leadId = Number(forwardLead.lead_id);
        const matchedLead = response.data.find(item => item.id === leadId);
        setLeadDetails(matchedLead || null);
      } else {
        setLeadDetails(null);
      }
    } catch (error) {
      console.error('Error fetching lead details for forward lead:', error);
      setLeadDetails(null);
    } finally {
      setIsLoadingLead(false);
    }
  }, [forwardLead?.lead_id, userData?.userid, userData?.token]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  const fallbackLeadForForward = useMemo<Lead>(() => {
    return {
      id: Number(forwardLead?.lead_id) || 0,
      status: (forwardLead?.status || 'new').toLowerCase(),
      name: `Lead #${forwardLead?.lead_id || '-'}`,
      mobile: '',
      address: '',
      requirement: forwardLead?.requirement || '',
      created_at: forwardLead?.date_time || new Date().toISOString(),
    };
  }, [forwardLead]);

  const handleForwardLead = () => {
    navigation?.navigate('ForwardLead', {
      lead: leadDetails || fallbackLeadForForward,
    });
  };

  const formatDateTime = (value?: string) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hour12}:${minutes} ${ampm}`;
  };

  const statusColor = useMemo(() => {
    const status = (forwardLead?.status || '').toLowerCase().trim();
    if (status === 'contacted') {
      return '#42A5F5';
    }
    if (status === 'interested') {
      return '#66BB6A';
    }
    if (status === 'follow up') {
      return '#FFB300';
    }
    if (status === 'closed') {
      return '#EF5350';
    }
    return '#D4AF37';
  }, [forwardLead?.status]);

  return (
    <View style={[styles.container, {backgroundColor: '#121212'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={[styles.header, {paddingTop: insets.top + 10}]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          Forward Lead Details
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={22} color="#D4AF37" />
            <Text style={styles.cardTitle}>Lead Details</Text>
          </View>

          {isLoadingLead ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color="#D4AF37" />
              <Text style={styles.loaderText}>Loading lead details...</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>
                  {leadDetails?.name || `Lead #${forwardLead?.lead_id || '-'}`}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoItem}>
                <Text style={styles.label}>Requirement</Text>
                <Text style={styles.value}>
                  {leadDetails?.requirement || forwardLead?.requirement || '-'}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="forward" size={22} color="#D4AF37" />
            <Text style={styles.cardTitle}>Forward Details</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: `${statusColor}22`,
                  borderColor: `${statusColor}66`,
                },
              ]}>
              <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
              <Text style={[styles.statusText, {color: statusColor}]}>
                {forwardLead?.status || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Forwarded By</Text>
            <Text style={styles.value}>{forwardLead?.forward_by || '-'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Forwarded To</Text>
            <Text style={styles.value}>{forwardLead?.forward_to || '-'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Forwarded At</Text>
            <Text style={styles.value}>{formatDateTime(forwardLead?.date_time)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Remark</Text>
            <Text style={styles.value}>{forwardLead?.remark || '-'}</Text>
          </View>
        </View>

        <Button
          title="FORWARD LEAD"
          onPress={handleForwardLead}
          style={styles.forwardButton}
        />
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
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loaderText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 13,
  },
  infoItem: {
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  forwardButton: {
    marginTop: 4,
  },
});
