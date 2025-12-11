import { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { AudioService, AudioServiceError, type Letter } from '@/src/services/AudioService'
import { Text } from '@/components/Themed'

export default function GameScreen() {
  const [isLoadingAudio, setIsLoadingAudio] = useState(true)

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const result = await AudioService.preloadSounds()

        if (result.failed.length > 0) {
          Alert.alert(
            'Audio Warning',
            `Failed to load sounds for: ${result.failed.join(', ')}. Game will continue without these sounds.`
          )
        }

        setIsLoadingAudio(false)
      } catch (error) {
        if (error instanceof AudioServiceError) {
          Alert.alert(
            'Audio Error',
            'Failed to load audio files. The game will not have sound.',
            [{ text: 'OK', onPress: () => setIsLoadingAudio(false) }]
          )
        } else {
          Alert.alert('Audio Error', 'Unexpected error while loading audio.')
          setIsLoadingAudio(false)
        }
      }
    }

    loadAudio()

    return () => {
      AudioService.unloadSounds()
    }
  }, [])

  const playLetterStimulus = async (letter: Letter) => {
    try {
      await AudioService.playLetter(letter)
    } catch (error) {
      if (error instanceof AudioServiceError) {
        console.error(`Audio playback failed for ${letter}:`, error.message)
      } else {
        console.error('Unexpected error while playing letter sound', error)
      }
    }
  }

  if (isLoadingAudio) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading audio...</Text>
        <Text style={styles.subtitle}>Preparing letter sounds</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Screen</Text>
      <Text style={styles.subtitle}>Audio ready. Gameplay coming soon.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
})
