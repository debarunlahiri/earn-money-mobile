import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BlurView} from '@react-native-community/blur';
import {LinearGradient} from 'expo-linear-gradient';
import {FallingRupees} from '../components/FallingRupee';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {ForwardLeadListItem, viewForwardLeads} from '../services/api';

interface ForwardLeadsScreenProps {
  navigation: any;
}

interface ForwardLeadCardItem extends ForwardLeadListItem {
  id: string;
}

export const ForwardLeadsScreen: React.FC<ForwardLeadsScreenProps> = ({
  navigation,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();

  const [leads, setLeads] = useState<ForwardLeadCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForwardLeads = useCallback(async () => {
    if (!userData?.userid || !userData?.token) {
      setError('Authentication required');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const response = await viewForwardLeads(userData.userid, userData.token);

      if (response.status === 'success' && response.data) {
        const mappedLeads = Array.isArray(response.data)
          ? response.data.map((item, index) => ({
              ...item,
              id: `${item.lead_id || index}`,
            }))
          : Object.entries(response.data).map(([id, item]) => ({
              ...item,
              id,
            }));

        mappedLeads.sort((a, b) => {
          const first = new Date(b.date_time).getTime();
          const second = new Date(a.date_time).getTime();
          return first - second;
        });

        setLeads(mappedLeads);
      } else {
        setLeads([]);
        setError(response.message || 'Failed to fetch forward leads');
      }
    } catch (err) {
      console.error('Error fetching forward leads:', err);
      setLeads([]);
      setError('An error occurred while fetching forward leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchForwardLeads();
  }, [fetchForwardLeads]);

  useFocusEffect(
    useCallback(() => {
      fetchForwardLeads();
    }, [fetchForwardLeads]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchForwardLeads();
  }, [fetchForwardLeads]);

  const statusColorMap = useMemo(
    () => ({
      contacted: '#42A5F5',
      interested: '#66BB6A',
      'follow up': '#FFB300',
      closed: '#EF5350',
      new: '#D4AF37',
    }),
    [],
  );

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase().trim();
    return statusColorMap[normalized as keyof typeof statusColorMap] || '#D4AF37';
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const datePart = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  };

  const renderItem = ({item}: {item: ForwardLeadCardItem}) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.leadCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation?.navigate('ForwardLeadDetails', {
            forwardLead: item,
          })
        }>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(40, 40, 40, 0.95)"
        />

        <View style={styles.topRow}>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>Lead #{item.lead_id}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                borderColor: `${statusColor}66`,
                backgroundColor: `${statusColor}22`,
              },
            ]}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.statusText, {color: statusColor}]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Icon name="schedule" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{formatDateTime(item.date_time)}</Text>
        </View>

        <View style={styles.assignmentRow}>
          <View style={styles.assignmentItem}>
            <Text style={styles.assignmentLabel}>Forwarded By</Text>
            <Text style={styles.assignmentValue}>{item.forward_by || '-'}</Text>
          </View>
          <View style={styles.assignmentArrow}>
            <Icon name="arrow-forward" size={16} color="#D4AF37" />
          </View>
          <View style={styles.assignmentItem}>
            <Text style={styles.assignmentLabel}>Forwarded To</Text>
            <Text style={styles.assignmentValue}>{item.forward_to || '-'}</Text>
          </View>
        </View>

        {item.requirement ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Requirement</Text>
            <Text style={styles.infoValue}>{item.requirement}</Text>
          </View>
        ) : null}

        {item.remark ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Remark</Text>
            <Text style={styles.infoValue}>{item.remark}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.summaryChip}>
        <Text style={styles.summaryChipText}>Total: {leads.length}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <LinearGradient
            colors={['#F5D78E', '#D4AF37']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.emptyIconCircle}>
            <Icon name="inbox" size={52} color="#1a1a1a" />
          </LinearGradient>
        </View>
        <Text style={styles.emptyTitle}>No Forward Leads Found</Text>
        <Text style={styles.emptySubtitle}>
          Forwarded leads will appear here once created.
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading forward leads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
        />
        <View style={styles.headerOverlay} />
        <FallingRupees count={12} />
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Forward Leads
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={refreshing}>
            <Icon
              name="refresh"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={leads}
        renderItem={renderItem}
        keyExtractor={item => `${item.id}-${item.lead_id}`}
        contentContainerStyle={[
          styles.listContent,
          {paddingTop: insets.top + 78},
          leads.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 90,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 10,
  },
  summaryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryChipText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  leadCard: {
    borderRadius: 14,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 0.72)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  idBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  idBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentItem: {
    flex: 1,
  },
  assignmentArrow: {
    paddingHorizontal: 8,
  },
  assignmentLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  assignmentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  infoBlock: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyIconWrap: {
    marginBottom: 14,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
