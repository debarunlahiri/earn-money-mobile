import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Button} from '../components/Button';
import {Dialog} from '../components/Dialog';
import {EnhancedTouchable} from '../components/EnhancedTouchable';
import {useAuth} from '../context/AuthContext';
import {
  Lead,
  getAllStatuses,
  getAllUsers,
  submitForwardLead,
} from '../services/api';
import {useTheme} from '../theme/ThemeContext';

interface ForwardLeadScreenProps {
  navigation?: any;
  route?: {
    params?: {
      lead: Lead;
    };
  };
}

interface ForwardUserOption {
  id: string;
  name: string;
}

type DialogType = 'info' | 'success' | 'error' | 'warning';
type PickerType = 'user' | 'status' | null;

interface SelectFieldProps {
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  isOpen: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  placeholder,
  icon,
  isOpen,
  onPress,
  theme,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, {color: theme.colors.text}]}>
        {label}
      </Text>
      <EnhancedTouchable
        onPress={onPress}
        activeOpacity={0.9}
        hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
        <View
          style={[
            styles.selectContainer,
            {
              borderColor: isOpen
                ? 'rgba(212, 175, 55, 0.7)'
                : 'rgba(212, 175, 55, 0.4)',
              backgroundColor: 'rgba(139, 69, 19, 0.14)',
            },
          ]}>
          <View style={styles.selectLeft}>
            <Icon name={icon} size={20} color={theme.colors.textSecondary} />
            <Text
              style={[
                styles.selectText,
                {color: value ? theme.colors.text : theme.colors.textSecondary},
              ]}
              numberOfLines={1}>
              {value || placeholder}
            </Text>
          </View>
          <Icon
            name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
      </EnhancedTouchable>
    </View>
  );
};

export const ForwardLeadScreen: React.FC<ForwardLeadScreenProps> = ({
  navigation,
  route,
}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {userData} = useAuth();
  const lead = route?.params?.lead;

  const [users, setUsers] = useState<ForwardUserOption[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [forwardTo, setForwardTo] = useState('');
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');

  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [userSearch, setUserSearch] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState<DialogType>('info');
  const [dialogOnConfirm, setDialogOnConfirm] = useState<
    (() => void) | undefined
  >(undefined);

  const selectedForwardUser = useMemo(
    () => users.find(user => user.id === forwardTo),
    [users, forwardTo],
  );

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter(
      user =>
        user.name.toLowerCase().includes(query) || user.id.toLowerCase().includes(query),
    );
  }, [users, userSearch]);

  const showDialog = useCallback(
    (
      message: string,
      title?: string,
      type: DialogType = 'info',
      onConfirm?: () => void,
    ) => {
      setDialogTitle(title || '');
      setDialogMessage(message);
      setDialogType(type);
      if (onConfirm) {
        setDialogOnConfirm(() => onConfirm);
      } else {
        setDialogOnConfirm(undefined);
      }
      setDialogVisible(true);
    },
    [],
  );

  const closePicker = useCallback(() => {
    setActivePicker(null);
    setUserSearch('');
  }, []);

  const openPicker = useCallback((picker: 'user' | 'status') => {
    setActivePicker(picker);
    if (picker !== 'user') {
      setUserSearch('');
    }
  }, []);

  const fetchFormOptions = useCallback(async () => {
    if (!userData?.userid || !userData?.token) {
      setIsLoadingData(false);
      showDialog('Authentication error. Please login again.', 'Error', 'error');
      return;
    }

    try {
      setIsLoadingData(true);

      const [usersResponse, statusResponse] = await Promise.all([
        getAllUsers(userData.userid, userData.token),
        getAllStatuses(userData.userid, userData.token),
      ]);

      if (
        usersResponse.status === 'success' &&
        usersResponse.message &&
        typeof usersResponse.message === 'object' &&
        !Array.isArray(usersResponse.message)
      ) {
        const usersList = Object.entries(usersResponse.message)
          .map(([id, name]) => ({
            id,
            name: String(name),
          }))
          .sort((a, b) => {
            const nameDiff = a.name.localeCompare(b.name);
            if (nameDiff !== 0) {
              return nameDiff;
            }
            return a.id.localeCompare(b.id, undefined, {numeric: true});
          });
        setUsers(usersList);
      } else {
        setUsers([]);
      }

      if (
        statusResponse.status === 'success' &&
        Array.isArray(statusResponse.message)
      ) {
        setStatuses(statusResponse.message);
      } else {
        setStatuses([]);
      }
    } catch (error) {
      console.error('Error fetching forward lead form data:', error);
      showDialog(
        'Failed to load users and statuses. Please try again.',
        'Error',
        'error',
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [showDialog, userData]);

  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  const handleSubmit = async () => {
    if (!lead?.id) {
      showDialog('Lead details not found.', 'Error', 'error');
      return;
    }

    if (!userData?.userid || !userData?.token) {
      showDialog('Authentication error. Please login again.', 'Error', 'error');
      return;
    }

    if (!forwardTo) {
      showDialog('Please select user in Forward To.', 'Validation', 'warning');
      return;
    }

    if (!status) {
      showDialog('Please select a status.', 'Validation', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitForwardLead({
        lead_id: lead.id,
        forward_to: forwardTo,
        status,
        remark: remark.trim(),
        user_id: userData.userid,
        userid: userData.userid,
        token: userData.token,
      });

      if (response.status === 'success' && response.status_code === 200) {
        showDialog(
          response.message || 'Lead forwarded successfully.',
          'Success',
          'success',
          () => navigation?.goBack(),
        );
      } else {
        showDialog(
          response.message || 'Failed to forward lead.',
          'Error',
          'error',
        );
      }
    } catch (error) {
      console.error('Error forwarding lead:', error);
      showDialog('Failed to forward lead. Please try again.', 'Error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPickerItem = (
    itemKey: string,
    title: string,
    subtitle: string | null,
    isSelected: boolean,
    onPress: () => void,
  ) => {
    return (
      <EnhancedTouchable
        key={itemKey}
        onPress={onPress}
        activeOpacity={0.85}
        hitSlopSize="small"
        style={[
          styles.modalItem,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: isSelected
              ? 'rgba(212, 175, 55, 0.12)'
              : 'transparent',
          },
        ]}>
        <View style={styles.modalItemInner}>
          {isSelected ? (
            <Icon name="check-circle" size={20} color={theme.colors.primary} />
          ) : (
            <Icon
              name="radio-button-unchecked"
              size={18}
              color={theme.colors.textSecondary}
            />
          )}
          <View style={styles.modalItemTextWrap}>
            <Text style={[styles.modalItemTitle, {color: theme.colors.text}]}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.modalItemSubtitle,
                  {color: theme.colors.textSecondary},
                ]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </EnhancedTouchable>
    );
  };

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
          Forward Lead
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Icon name="send" size={20} color="#121212" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Assign and Update Lead</Text>
            <Text style={styles.heroSubtitle}>
              Forward this lead to another user and set the latest status.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={22} color="#D4AF37" />
            <Text style={styles.cardTitle}>Lead Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lead ID</Text>
            <Text style={styles.infoValue}>{lead?.id || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{lead?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{lead?.mobile || '-'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="manage-accounts" size={22} color="#D4AF37" />
            <Text style={styles.cardTitle}>Forward Details</Text>
          </View>

          {isLoadingData ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loaderText}>Loading users and statuses...</Text>
            </View>
          ) : (
            <>
              <SelectField
                label="Forward To *"
                value={selectedForwardUser?.name || ''}
                placeholder="Select user"
                icon="group"
                isOpen={activePicker === 'user'}
                onPress={() => openPicker('user')}
                theme={theme}
              />

              <SelectField
                label="Status *"
                value={status}
                placeholder="Select status"
                icon="flag"
                isOpen={activePicker === 'status'}
                onPress={() => openPicker('status')}
                theme={theme}
              />

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, {color: theme.colors.text}]}>
                  Remark
                </Text>
                <View
                  style={[
                    styles.remarkContainer,
                    {
                      borderColor: 'rgba(212, 175, 55, 0.4)',
                      backgroundColor: 'rgba(139, 69, 19, 0.14)',
                    },
                  ]}>
                  <View style={styles.remarkIconWrap}>
                    <Icon
                      name="comment"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                  <TextInput
                    value={remark}
                    onChangeText={setRemark}
                    placeholder="Add note (optional)"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    style={[styles.remarkInput, {color: theme.colors.text}]}
                  />
                </View>
              </View>

              <Button
                title={isSubmitting ? 'FORWARDING...' : 'FORWARD LEAD'}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
              />
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={closePicker}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closePicker}>
          <TouchableOpacity
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
              {activePicker === 'user' ? 'Select User' : 'Select Status'}
            </Text>

            {activePicker === 'user' ? (
              <View
                style={[
                  styles.searchContainer,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  },
                ]}>
                <Icon name="search" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  value={userSearch}
                  onChangeText={setUserSearch}
                  placeholder="Search by name or ID"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[styles.searchInput, {color: theme.colors.text}]}
                />
                {userSearch.trim().length > 0 ? (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setUserSearch('')}>
                    <Icon
                      name="close"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <ScrollView
              style={styles.modalList}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}>
              {activePicker === 'user' ? (
                filteredUsers.length > 0 ? (
                  filteredUsers.map(user =>
                    renderPickerItem(
                      `user-${user.id}`,
                      user.name,
                      `User ID: ${user.id}`,
                      forwardTo === user.id,
                      () => {
                        setForwardTo(user.id);
                        closePicker();
                      },
                    ),
                  )
                ) : (
                  <View style={styles.emptyStateWrap}>
                    <Text
                      style={[
                        styles.emptyStateText,
                        {color: theme.colors.textSecondary},
                      ]}>
                      No users found.
                    </Text>
                  </View>
                )
              ) : statuses.length > 0 ? (
                statuses.map((item, index) =>
                  renderPickerItem(
                    `status-${item}-${index}`,
                    item,
                    null,
                    status === item,
                    () => {
                      setStatus(item);
                      closePicker();
                    },
                  ),
                )
              ) : (
                <View style={styles.emptyStateWrap}>
                  <Text
                    style={[styles.emptyStateText, {color: theme.colors.textSecondary}]}>
                    No status options found.
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#F7F7F7',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSubtitle: {
    color: '#D6D6D6',
    fontSize: 13,
    lineHeight: 18,
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
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loaderText: {
    marginTop: 12,
    color: '#aaa',
    fontSize: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  selectText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  remarkContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  remarkIconWrap: {
    paddingTop: 2,
    marginRight: 8,
  },
  remarkInput: {
    flex: 1,
    minHeight: 84,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 22,
    padding: 0,
    margin: 0,
  },
  submitButton: {
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '82%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 8,
  },
  clearSearchButton: {
    marginLeft: 8,
    padding: 4,
  },
  modalList: {
    maxHeight: 430,
  },
  modalListContent: {
    paddingBottom: 4,
  },
  modalItem: {
    minHeight: 58,
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  modalItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemTextWrap: {
    flex: 1,
    paddingLeft: 10,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalItemSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  emptyStateWrap: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
  },
});
