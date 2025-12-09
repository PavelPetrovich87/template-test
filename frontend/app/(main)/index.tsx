import { Link } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { TerminalFrame } from '@/components/TerminalFrame'
import { ShardCounter } from '@/components/ShardCounter'
import { Text, View } from '@/components/Themed'
import type { IUserStats } from '@/src/types/game'

const colors = {
  background: '#0a0a0a',
  primary: '#00ff41',
  accent: '#00d4ff',
  border: 'rgba(0, 255, 65, 0.3)',
  text: '#00ff41',
}

const userStats: IUserStats = {
  totalShards: 1234,
  dailyStreak: 5,
  peakNLevel: 4,
}

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <TerminalFrame title="Neural Breach">
        <View style={styles.topRow}>
          <Text style={styles.tagline}>Main breach console</Text>
          <ShardCounter count={userStats.totalShards} />
        </View>

        <View style={styles.separator} />

        <Link href="/(main)/game" asChild>
          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Start Breach</Text>
          </Pressable>
        </Link>

        <View style={styles.grid}>
          <Link href="/(main)/store" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.buttonText}>Hardware</Text>
            </Pressable>
          </Link>
          <Link href="/(main)/stats" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.buttonText}>Stats</Text>
            </Pressable>
          </Link>
          <Link href="/(main)/leaderboard" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.buttonText}>Board</Text>
            </Pressable>
          </Link>
          <Link href="/(main)/settings" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button">
              <Text style={styles.buttonText}>Settings</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{userStats.dailyStreak} days</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>N-{userStats.peakNLevel}</Text>
          </View>
        </View>
      </TerminalFrame>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tagline: {
    color: colors.accent,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.text,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },
  secondaryButton: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: 'rgba(0, 255, 65, 0.08)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBlock: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  statLabel: {
    color: colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.9,
  },
})
