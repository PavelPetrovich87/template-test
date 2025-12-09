import type { ReactNode } from 'react'
import { StyleSheet, View as RNView } from 'react-native'
import { Text, View } from '@/components/Themed'

type TerminalFrameProps = {
  children: ReactNode
  title?: string
}

const colors = {
  background: '#0a0a0a',
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.55)',
}

export const TerminalFrame = ({ children, title }: TerminalFrameProps) => {
  return (
    <View style={styles.container}>
      {title ? (
        <RNView style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <RNView style={styles.signal} />
        </RNView>
      ) : null}
      <RNView style={styles.body}>{children}</RNView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 14,
    padding: 18,
    shadowColor: colors.primary,
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  signal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  body: {
    gap: 14,
  },
})
