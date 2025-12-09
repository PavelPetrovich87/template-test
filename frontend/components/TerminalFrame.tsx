import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View as RNView } from 'react-native'
import { Text, View, useThemeColor } from '@/components/Themed'
import { useColorScheme } from '@/components/useColorScheme'

type TerminalFrameProps = {
  children: ReactNode
  title?: string
}

const palettes = {
  dark: {
    background: '#0a0a0a',
    primary: '#00ff41',
    accent: '#00ff41',
    border: 'rgba(0, 255, 65, 0.55)',
    corner: '#0f0f0f',
    scanline: 'rgba(0, 255, 65, 0.14)',
  },
  light: {
    background: '#1a1a1a',
    primary: '#00d4aa',
    accent: '#00d4aa',
    border: 'rgba(0, 212, 170, 0.5)',
    corner: '#222222',
    scanline: 'rgba(0, 212, 170, 0.14)',
  },
} as const

export const TerminalFrame = ({ children, title }: TerminalFrameProps) => {
  const theme = useColorScheme() ?? 'light'
  const palette = useMemo(() => (theme === 'dark' ? palettes.dark : palettes.light), [theme])
  const titleColor = useThemeColor({ light: palette.primary, dark: palette.primary }, 'text')
  const glow = useRef(new Animated.Value(0)).current
  const scanShift = useRef(new Animated.Value(0)).current
  const [frameHeight, setFrameHeight] = useState(0)

  useEffect(() => {
    glow.setValue(0)
    scanShift.setValue(0)

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    )

    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanShift, {
          toValue: 1,
          duration: 3200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanShift, {
          toValue: 0,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    )

    glowLoop.start()
    scanLoop.start()

    return () => {
      glowLoop.stop()
      scanLoop.stop()
    }
  }, [glow, scanShift])

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.9],
  })

  const scanlineTranslate = scanShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  })

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setFrameHeight(event.nativeEvent.layout.height)
  }, [])

  const scanlineCount = useMemo(() => {
    if (frameHeight <= 0) {
      return 0
    }

    return Math.ceil(frameHeight / 4)
  }, [frameHeight])

  return (
    <RNView style={styles.wrapper} onLayout={handleLayout}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            borderColor: palette.border,
            shadowColor: palette.primary,
            opacity: glowOpacity,
          },
        ]}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.background,
            borderColor: palette.border,
            shadowColor: palette.primary,
          },
        ]}
      >
        {title ? (
          <RNView style={[styles.header, { borderBottomColor: palette.border }]}>
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
            <RNView
              style={[
                styles.signal,
                { backgroundColor: palette.accent, shadowColor: palette.accent },
              ]}
            />
          </RNView>
        ) : null}
        <RNView style={styles.body}>{children}</RNView>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scanlines,
            { transform: [{ translateY: scanlineTranslate }] },
          ]}
        >
          {scanlineCount
            ? Array.from({ length: scanlineCount }).map((_, index) => (
                <RNView
                  key={`scanline-${index}`}
                  style={[
                    styles.scanline,
                    { top: index * 4, backgroundColor: palette.scanline },
                  ]}
                />
              ))
            : null}
        </Animated.View>
        <RNView pointerEvents="none" style={styles.corners}>
          <RNView
            style={[
              styles.corner,
              styles.topLeft,
              { borderColor: palette.primary, backgroundColor: palette.corner },
            ]}
          />
          <RNView
            style={[
              styles.corner,
              styles.topRight,
              { borderColor: palette.primary, backgroundColor: palette.corner },
            ]}
          />
          <RNView
            style={[
              styles.corner,
              styles.bottomLeft,
              { borderColor: palette.primary, backgroundColor: palette.corner },
            ]}
          />
          <RNView
            style={[
              styles.corner,
              styles.bottomRight,
              { borderColor: palette.primary, backgroundColor: palette.corner },
            ]}
          />
        </RNView>
        <RNView pointerEvents="none" style={[styles.innerGlow, { borderColor: palette.border }]} />
      </View>
      <RNView pointerEvents="none" style={[styles.scanOverlay, { borderColor: palette.border }]} />
    </RNView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
  },
  container: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  signal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  body: {
    gap: 14,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 2,
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
    opacity: 0,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'none',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 1,
  },
  corners: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 6,
    opacity: 0.8,
  },
  topLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.35,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    opacity: 0.18,
    zIndex: -1,
  },
})
