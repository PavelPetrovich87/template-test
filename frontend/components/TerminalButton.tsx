import type { JSX, ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type TerminalButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  icon?: ReactNode
  accessibilityLabel?: string
}

const colors = {
  background: '#0a0a0a',
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.55)',
  text: '#0a0a0a',
}

export const TerminalButton = ({
  label,
  onPress,
  variant,
  size,
  fullWidth,
  disabled,
  icon,
  accessibilityLabel,
}: TerminalButtonProps): JSX.Element => {
  const resolvedVariant: ButtonVariant = variant ?? 'primary'
  const resolvedSize: ButtonSize = size ?? 'md'
  const isDisabled = disabled === true

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        fullWidth === true && styles.fullWidth,
        styles[resolvedVariant],
        styles[`${resolvedSize}Padding`],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, styles[`${resolvedVariant}Label`]]}>{label}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    backgroundColor: colors.background,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '800',
    fontFamily: 'SpaceMono',
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  primaryLabel: {
    color: colors.background,
  },
  secondary: {
    backgroundColor: 'rgba(0, 255, 65, 0.08)',
  },
  secondaryLabel: {
    color: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  ghostLabel: {
    color: colors.accent,
  },
  smPadding: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  mdPadding: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  lgPadding: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
