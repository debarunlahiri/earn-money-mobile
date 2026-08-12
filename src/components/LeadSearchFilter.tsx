import React, {useRef} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
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
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    Keyboard.dismiss();
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.searchBox}
        onPress={() => inputRef.current?.focus()}>
        <Icon name="search" size={22} color="rgba(255, 255, 255, 0.55)" />
        <TextInput
          ref={inputRef}
          value={search}
          onChangeText={onSearchChange}
          onSubmitEditing={() => inputRef.current?.focus()}
          placeholder="Search by name, mobile or address"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          style={styles.input}
          selectionColor="#D4AF37"
          returnKeyType="search"
          blurOnSubmit={false}
        />
        <View style={styles.trailingActions} pointerEvents="none">
          {searching && <ActivityIndicator size="small" color="#D4AF37" />}
        </View>
      </Pressable>
      {search ? (
        <TouchableOpacity
          onPressIn={handleClear}
          style={styles.clearButton}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Clear search">
          <Icon name="close" size={22} color="#D4AF37" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(24, 24, 28, 0.9)',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    paddingVertical: 0,
    color: '#FFFFFF',
    fontSize: 14,
    paddingRight: 38,
  },
  trailingActions: {
    position: 'absolute',
    top: 0,
    right: 12,
    bottom: 0,
    zIndex: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(24, 24, 28, 0.9)',
  },
});
