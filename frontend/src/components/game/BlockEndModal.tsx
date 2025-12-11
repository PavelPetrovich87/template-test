import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'
import type { IBlock } from '@/src/types/game'

export interface IBlockEndModalProps {
  visible: boolean
  block: IBlock
  nextNLevel: number
  onContinue: () => void
  onQuit: () => void
}

export const BlockEndModal = ({ visible, block, nextNLevel, onContinue, onQuit }: IBlockEndModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" accessibilityViewIsModal>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title} accessibilityRole="header">
            BLOCK COMPLETED
          </Text>
          <View style={styles.divider} />
          <View style={styles.statsContainer}>
            <StatRow label="Accuracy" value={`${Math.round(block.accuracy)}%`} />
            <StatRow label="Data Shards" value={`${block.shardsEarned} / 20`} />
            <StatRow label="Current N-Level" value={block.nLevel.toString()} />
            <StatRow
              label="Connection"
              value={block.hitSafeMode ? '⚠ Lost' : '✓ Stable'}
              valueColor={block.hitSafeMode ? '#ff3333' : '#00ff41'}
            />
            <StatRow label="Next Block" value={`N = ${nextNLevel}`} highlight />
          </View>
          <View style={styles.divider} />
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={onQuit}
              accessibilityRole="button"
              accessibilityLabel="Quit session"
            >
              <Text style={styles.buttonTextSecondary}>QUIT</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonPrimary]}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to next block"
            >
              <Text style={styles.buttonTextPrimary}>CONTINUE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const StatRow = ({
  label,
  value,
  valueColor,
  highlight,
}: {
  label: string
  value: string
  valueColor?: string
  highlight?: boolean
}) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}:</Text>
    <Text style={[styles.statValue, { color: valueColor || '#00ff41' }, highlight && styles.statHighlight]}>
      {value}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#00ff41',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff41',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 255, 65, 0.3)',
    marginVertical: 16,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#00d4ff',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statHighlight: {
    fontSize: 18,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: '#00ff41',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ff41',
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
    letterSpacing: 1,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff41',
    letterSpacing: 1,
  },
})
