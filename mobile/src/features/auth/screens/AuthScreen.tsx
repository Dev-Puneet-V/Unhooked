import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../../../shared/theme';

const AuthScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Unhooked</Text>
          <Text style={styles.title}>Daily current affairs quiz</Text>
          <Text style={styles.subtitle}>
            Sign in quickly and jump into today&apos;s challenge.
          </Text>
        </View>

        <View style={styles.form}>
          <Pressable style={styles.googleButton}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textPlaceholder}
              style={styles.input}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Minimum 8 characters"
              placeholderTextColor={theme.colors.textPlaceholder}
              secureTextEntry
              style={styles.input}
              textContentType="password"
            />
          </View>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>

          <Text style={styles.helperText}>
            New here? We&apos;ll create your account automatically.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  header: {
    marginBottom: theme.spacing['3xl'],
  },
  brand: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.brand,
    fontWeight: theme.typography.weight.extraBold,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size['2xl'],
    fontWeight: theme.typography.weight.bold,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.lineHeight.md,
    marginTop: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.xl,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: theme.control.borderWidth,
    flexDirection: 'row',
    gap: theme.spacing.md,
    height: theme.control.height,
    justifyContent: 'center',
  },
  googleIcon: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.extraBold,
  },
  googleButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  divider: {
    backgroundColor: theme.colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: theme.control.borderWidth,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.size.lg,
    height: theme.control.height,
    paddingHorizontal: theme.spacing.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    height: theme.control.height,
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.extraBold,
  },
  helperText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.size.xs,
    lineHeight: theme.typography.lineHeight.sm,
    textAlign: 'center',
  },
});
