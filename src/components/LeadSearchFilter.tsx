import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type LeadFilter =
  | 'all'
  | 'new'
  | 'processing'
  | 'cancelled'
  | 'converted';

interface LeadSearchFilterProps {
  search: string;
  searching: boolean;
  onSearchChange: (value: string) => void;
}

export const LeadSearchFilter: React.FC<LeadSearchFilterProps> = ({
  search,
  searching,
  onSearchChange,
}) => (
  <View style={styles.container}>
    <View style={styles.searchBox}>
      <Icon name="search" size={22} color="rgba(255, 255, 255, 0.55)" />
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search by name, mobile or address"
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        style={styles.input}
        selectionColor="#D4AF37"
        returnKeyType="search"
      />
      {searching ? (
        <ActivityIndicator size="small" color="#D4AF37" />
      ) : search ? (
        <TouchableOpacity
          onPress={() => onSearchChange('')}
          style={styles.clearButton}
          accessibilityLabel="Clear search">
          <Icon name="cancel" size={20} color="rgba(255, 255, 255, 0.65)" />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 18,
  },
  searchBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(24, 24, 28, 0.9)',
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    paddingVertical: 0,
    color: '#FFFFFF',
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
});
