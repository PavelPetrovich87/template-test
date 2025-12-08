import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Placeholder - Content to be implemented</Text>
      <Text style={styles.helloWorld}>hello world</Text>
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
  },
  helloWorld: {
    fontSize: 16,
    marginTop: 16,
    color: 'green',
  },
})
