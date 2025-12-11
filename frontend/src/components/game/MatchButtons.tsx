import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'
import type { ResponseType } from '@/src/types/game'

export interface IMatchButtonsProps {
  onPress: (type: ResponseType) => void
  disabled?: boolean
}

export const MatchButtons = ({ onPress, disabled }: IMatchButtonsProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.buttonLeft,
          (pressed || disabled) && styles.buttonPressed,
        ]}
        onPress={() => onPress('audio')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Audio match"
        accessibilityHint="Marks that the letter matches the one N steps back"
      >
        <Text style={styles.buttonText}>AUDIO MATCH</Text>
        <Text style={styles.buttonHint}>(Letter)</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.buttonRight,
          (pressed || disabled) && styles.buttonPressed,
        ]}
        onPress={() => onPress('position')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Position match"
        accessibilityHint="Marks that the grid position matches the one N steps back"
      >
        <Text style={styles.buttonText}>POSITION MATCH</Text>
        <Text style={styles.buttonHint}>(Grid)</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#00ff41',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonLeft: {},
  buttonRight: {},
  buttonPressed: {
    opacity: 0.6,
    backgroundColor: 'rgba(0, 255, 65, 0.3)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff41',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttonHint: {
    fontSize: 10,
    color: '#00d4ff',
    marginTop: 4,
  },
})
