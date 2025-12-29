import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { TransactionFilters, TransactionDateFilter, TransactionStatus } from '@/types';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const dateOptions: { value: TransactionDateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const statusOptions: { value: TransactionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export function TransactionFiltersComponent({
  filters,
  onFiltersChange
}: TransactionFiltersProps) {
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant..."
          placeholderTextColor={colors.textMuted}
          value={filters.searchQuery}
          onChangeText={(text) => updateFilter('searchQuery', text)}
        />
        {filters.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => updateFilter('searchQuery', '')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {dateOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              filters.dateFilter === option.value && styles.filterChipActive
            ]}
            onPress={() => updateFilter('dateFilter', option.value)}
          >
            <Text style={[
              styles.filterChipText,
              filters.dateFilter === option.value && styles.filterChipTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.statusFilter !== 'all' && styles.filterChipActive
          ]}
          onPress={() => setShowStatusFilter(!showStatusFilter)}
        >
          <Text style={[
            styles.filterChipText,
            filters.statusFilter !== 'all' && styles.filterChipTextActive
          ]}>
            {statusOptions.find(s => s.value === filters.statusFilter)?.label || 'Status'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={filters.statusFilter !== 'all' ? colors.primary : colors.textMuted}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </ScrollView>

      {showStatusFilter && (
        <View style={styles.statusDropdown}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusOption,
                filters.statusFilter === option.value && styles.statusOptionActive
              ]}
              onPress={() => {
                updateFilter('statusFilter', option.value);
                setShowStatusFilter(false);
              }}
            >
              <Text style={[
                styles.statusOptionText,
                filters.statusFilter === option.value && styles.statusOptionTextActive
              ]}>
                {option.label}
              </Text>
              {filters.statusFilter === option.value && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing[2],
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing[4],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing[2],
  },
  statusDropdown: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  statusOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  statusOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
