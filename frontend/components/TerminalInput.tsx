import type { ReactElement } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type TextInputProps,
} from 'react-native'

type TerminalInputProps = {
  label: string
  value: string
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: KeyboardTypeOptions
  autoCapitalize?: TextInputProps['autoCapitalize']
  autoComplete?: TextInputProps['autoComplete']
  textContentType?: TextInputProps['textContentType']
  returnKeyType?: ReturnKeyTypeOptions
  autoCorrect?: boolean
  onChangeText: (value: string) => void
  onSubmitEditing?: () => void
  errorMessage?: string
}

const colors = {
  background: '#0a0a0a',
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.55)',
  placeholder: 'rgba(0, 212, 255, 0.65)',
  danger: '#ff4d4f',
}

export const TerminalInput = ({
  label,
  value,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  returnKeyType,
  autoCorrect,
  onChangeText,
  onSubmitEditing,
  errorMessage,
}: TerminalInputProps): ReactElement => {
  const resolvedAutoCapitalize = autoCapitalize ?? 'none'
  const resolvedAutoCorrect = autoCorrect ?? false

  return (
    <View style={styles.field}>
      <Text style={styles.label} accessibilityRole="header">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={resolvedAutoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        autoCorrect={resolvedAutoCorrect}
        onSubmitEditing={onSubmitEditing}
        style={[styles.input, errorMessage ? styles.inputError : null]}
        selectionColor={colors.accent}
        accessibilityLabel={label}
        accessibilityHint={placeholder}
        accessibilityState={{ disabled: false }}
      />
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primary,
    fontSize: 16,
    letterSpacing: 1.1,
    fontFamily: 'SpaceMono',
  },
  inputError: {
    borderColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
})
