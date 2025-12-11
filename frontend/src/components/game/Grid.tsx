import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import type { GridPosition } from '@/src/types/game'

export interface IGridProps {
  activeCell: GridPosition | null
  size?: number
}

export const Grid = ({ activeCell, size }: IGridProps) => {
  const gridSize = typeof size === 'number' ? size : 240
  const cellSize = gridSize / 3
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (activeCell !== null) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [activeCell, pulseAnim])

  return (
    <View style={[styles.grid, { width: gridSize, height: gridSize }]}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: activeCell === index ? '#00ff41' : 'transparent',
              transform: activeCell === index ? [{ scale: pulseAnim }] : [],
            },
          ]}
          accessibilityLabel={activeCell === index ? `Active cell ${index}` : `Cell ${index}`}
          accessibilityRole="text"
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#00ff41',
  },
  cell: {
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 65, 0.3)',
  },
})
