import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { Text } from '@/components/Themed'

export interface IStabilityBarProps {
  value: number
  showWarning?: boolean
}

export const StabilityBar = ({ value, showWarning }: IStabilityBarProps) => {
  const widthAnim = useRef(new Animated.Value(value)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [value, widthAnim])

  const getColor = () => {
    if (value > 70) return '#00ff41'
    if (value > 40) return '#ffb800'
    return '#ff3333'
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>CONNECTION STABILITY</Text>
        <Text style={styles.value}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.barBackground} accessibilityRole="progressbar">
        <Animated.View
          style={[
            styles.barFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
      {showWarning && (
        <View style={styles.warningBadge} accessibilityRole="alert">
          <Text style={styles.warningText}>⚠ CONNECTION LOST</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#00d4ff',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff41',
  },
  barBackground: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBadge: {
    backgroundColor: '#ff3333',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
})
