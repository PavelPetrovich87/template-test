import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'

type ShardCounterProps = {
  count: number
}

const colors = {
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.45)',
}

export const ShardCounter = ({ count }: ShardCounterProps) => {
  const formattedCount = count.toLocaleString('en-US')

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Shards</Text>
      <Text style={styles.value}>{formattedCount}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: 'rgba(0, 255, 65, 0.08)',
  },
  label: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
})
