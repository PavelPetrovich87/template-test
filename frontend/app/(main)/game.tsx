import { useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { AudioService, AudioServiceError } from '@/src/services/AudioService'
import { useGameStore } from '@/src/stores/gameStore'
import { useAuthStore } from '@/src/stores/authStore'
import { Grid } from '@/src/components/game/Grid'
import { StabilityBar } from '@/src/components/game/StabilityBar'
import { MatchButtons } from '@/src/components/game/MatchButtons'
import { BlockEndModal } from '@/src/components/game/BlockEndModal'
import { ShardCounter } from '@/components/ShardCounter'
import { Text } from '@/components/Themed'

export default function GameScreen() {
  const { user } = useAuthStore()
  const {
    phase,
    currentTrial,
    currentStability,
    currentShards,
    inSafeMode,
    currentNLevel,
    stimulusSequence,
    currentBlock,
    startSession,
    handleResponse,
    continueToNextBlock,
    quitSession,
    reset,
  } = useGameStore()

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
      } catch (error) {
        if (error instanceof AudioServiceError) {
          Alert.alert('Audio Error', 'Failed to load sounds. The game will not have audio.')
        } else {
          Alert.alert('Audio Error', 'Unexpected error while loading audio.')
        }
      }
    }

    loadAudio()

    return () => {
      void AudioService.unloadSounds().catch((audioError) => {
        console.error('Failed to unload sounds', audioError)
      })
      reset()
    }
  }, [reset])

  useEffect(() => {
    if (user && phase === 'idle') {
      startSession(user.id)
    }
  }, [user, phase, startSession])

  if (phase === 'idle' || phase === 'ready') {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing game...</Text>
      </View>
    )
  }

  const currentStimulus = stimulusSequence[currentTrial - 1]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShardCounter count={currentShards} />
        <View style={styles.nLevelBadge}>
          <Text style={styles.nLevelText}>N = {currentNLevel}</Text>
        </View>
        <View style={styles.trialCounter}>
          <Text style={styles.trialText}>{currentTrial} / 20</Text>
        </View>
      </View>

      <StabilityBar value={currentStability} showWarning={inSafeMode} />

      <View style={styles.gridContainer}>
        <Grid activeCell={phase === 'playing' ? currentStimulus?.position ?? null : null} />
      </View>

      <MatchButtons onPress={handleResponse} disabled={phase !== 'playing'} />

      {currentBlock && (
        <BlockEndModal
          visible={phase === 'blockEnd'}
          block={currentBlock}
          nextNLevel={currentNLevel}
          onContinue={continueToNextBlock}
          onQuit={quitSession}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#00ff41',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nLevelBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#00d4ff',
    borderRadius: 6,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  nLevelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4ff',
    letterSpacing: 1,
  },
  trialCounter: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  trialText: {
    fontSize: 14,
    color: '#00ff41',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
