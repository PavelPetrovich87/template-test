import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'
import { useRouter } from 'expo-router'

export default function StatsScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Screen</Text>
      <Text style={styles.subtitle}>Placeholder - Content to be implemented</Text>
      <Text style={styles.link} onPress={() => router.push('/(main)/leaderboard')}>
        View Leaderboard
      </Text>
    </View>
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
    marginBottom: 16,
  },
  link: {
    fontSize: 16,
    color: '#2e78b7',
    marginTop: 8,
  },
})
