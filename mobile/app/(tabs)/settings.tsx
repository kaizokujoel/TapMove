import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export default function SettingsTab() {
  const { user, logout } = usePrivy();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const settingsItems = [
    { icon: 'person-outline', label: 'Profile', onPress: () => {} },
    { icon: 'shield-checkmark-outline', label: 'Security', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
    { icon: 'lock-closed-outline', label: 'Privacy Policy', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.email?.address || 'TapMove User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email?.address || 'Not signed in'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {settingsItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={colors.textSecondary}
              />
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>TapMove v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing[6],
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[6],
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[2],
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
});
