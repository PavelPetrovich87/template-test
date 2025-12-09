import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'

import { useColorScheme } from '@/components/useColorScheme'
import { AuthService } from '@/src/services/AuthService'
import { useAuthStore } from '@/src/stores/authStore'

export {
  ErrorBoundary,
} from 'expo-router'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { isAuthenticated, initializeAuth, setSession } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    initializeAuth: state.initializeAuth,
    setSession: state.setSession,
  }))

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    const { data } = AuthService.onAuthChange(async (_event, session) => {
      setSession(session)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [setSession])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(main)" />
            <Stack.Screen name="+not-found" />
          </>
        ) : (
          <>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </>
        )}
      </Stack>
    </ThemeProvider>
  )
}
