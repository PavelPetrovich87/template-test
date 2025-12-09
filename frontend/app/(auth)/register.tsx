import { useState, type ReactElement } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { TerminalButton } from '@/components/TerminalButton'
import { TerminalFrame } from '@/components/TerminalFrame'
import { TerminalInput } from '@/components/TerminalInput'
import { useAuthStore } from '@/src/stores/authStore'

const colors = {
  background: '#050505',
  surface: '#0a0a0a',
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.35)',
  danger: '#ff4d4f',
  muted: '#8c8c8c',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateRegistration = (email: string, password: string, confirmPassword: string): string | null => {
  if (!emailRegex.test(email) || email.length > 255) {
    return 'Enter a valid email address (max 255 chars)'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }

  if (password.length > 128) {
    return 'Password cannot exceed 128 characters'
  }

  if (password !== confirmPassword) {
    return 'Passwords must match'
  }

  return null
}

export default function RegisterScreen(): ReactElement {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { register, isLoading } = useAuthStore((state) => ({
    register: state.register,
    isLoading: state.isLoading,
  }))

  const handleRegister = async (): Promise<void> => {
    const trimmedEmail = email.trim()
    const validationError = validateRegistration(trimmedEmail, password, confirmPassword)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      await register(trimmedEmail, password)
      setErrorMessage(null)
      router.replace('/(main)')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      setErrorMessage(message)
    }
  }

  return (
    <View style={styles.screen}>
      <TerminalFrame title="NEW USER REGISTRATION">
        <Text style={styles.subtitle}>Create your access profile</Text>

        <View style={styles.form}>
          <TerminalInput
            label="Email"
            value={email}
            placeholder="cyber@matrix.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            onChangeText={setEmail}
            returnKeyType="next"
          />

          <TerminalInput
            label="Password"
            value={password}
            placeholder="Min 8 characters"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            onChangeText={setPassword}
            returnKeyType="next"
          />

          <TerminalInput
            label="Confirm Password"
            value={confirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onChangeText={setConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
          ) : null}

          <TerminalButton
            label={isLoading ? 'Registering...' : 'Register'}
            onPress={handleRegister}
            fullWidth
            disabled={isLoading}
            accessibilityLabel="Submit registration details"
          />

          {isLoading ? <ActivityIndicator color={colors.accent} size="small" /> : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already registered?</Text>
          <Link
            href="/(auth)/login"
            style={styles.link}
            accessibilityRole="link"
            accessibilityLabel="Go to login"
          >
            Login
          </Link>
        </View>
      </TerminalFrame>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.accent,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: 'SpaceMono',
  },
  form: {
    gap: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  footerText: {
    color: colors.muted,
    letterSpacing: 0.8,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
})
