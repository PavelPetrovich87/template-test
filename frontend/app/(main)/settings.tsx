import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { TerminalFrame } from '@/components/TerminalFrame'
import { TerminalButton } from '@/components/TerminalButton'
import { useAudioStore } from '@/src/stores/audioStore'
import { useThemeStore } from '@/src/stores/themeStore'
import { THEMES } from '@/src/theme'

export default function SettingsScreen() {
  const { volume, isMuted, setVolume, toggleMute } = useAudioStore()
  const { currentTheme } = useThemeStore()
  const theme = THEMES[currentTheme]

  const handleVolumeChange = useCallback(
    (value: number) => {
      setVolume(value).catch((error) => {
        console.error('Failed to update volume', error)
      })
    },
    [setVolume]
  )

  const handleToggleMute = useCallback(() => {
    toggleMute().catch((error) => {
      console.error('Failed to toggle mute', error)
    })
  }, [toggleMute])

  return (
    <View style={styles.screen}>
      <TerminalFrame title="SETTINGS">
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.foreground }]}>
            AUDIO VOLUME: {Math.round(volume * 100)}%
          </Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.foregroundDim}
            thumbTintColor={theme.primary}
          />

          <TerminalButton label={isMuted ? 'UNMUTE' : 'MUTE'} onPress={handleToggleMute} variant="secondary" />
        </View>
      </TerminalFrame>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  section: {
    paddingVertical: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  slider: {
    width: '100%',
    height: 40,
  },
})
