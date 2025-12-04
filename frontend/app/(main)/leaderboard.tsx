import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'
import { Stack } from 'expo-router'

export default function LeaderboardScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Leaderboard' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Leaderboard Screen</Text>
        <Text style={styles.subtitle}>Placeholder - Content to be implemented</Text>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
})
