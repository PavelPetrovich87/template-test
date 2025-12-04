# Frontend Development Skill

> **Purpose:** Building responsive, performant React Native + Expo applications with modern UI/UX patterns.

---

## 1. Component Architecture

### Component Hierarchy
```
App
├── Screens (app/*.tsx)         # Expo Router pages
├── Components (src/components/) # Reusable UI
│   ├── ui/                     # Atomic components (Button, Input, Card)
│   ├── forms/                  # Form components
│   └── layouts/                # Layout wrappers
├── Hooks (src/hooks/)          # Custom hooks
├── Services (src/services/)    # API calls
└── Store (src/store/)          # Global state
```

### Component File Structure
```typescript
// src/components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { theme } from '@/theme'

// 1. Types first
interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

// 2. Component
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}: ButtonProps): JSX.Element => {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[size], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

// 3. Styles at bottom
const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  // ... more styles
})
```

---

## 2. Expo Router Navigation

### File-Based Routing
```
app/
├── _layout.tsx           # Root layout (providers, navigation structure)
├── index.tsx             # Home screen (/)
├── (auth)/               # Auth group (unprotected)
│   ├── _layout.tsx
│   ├── login.tsx         # /login
│   └── register.tsx      # /register
├── (tabs)/               # Tab navigator group
│   ├── _layout.tsx       # Tab bar config
│   ├── home.tsx          # /home
│   ├── profile.tsx       # /profile
│   └── settings.tsx      # /settings
└── [id].tsx              # Dynamic route (/:id)
```

### Root Layout with Providers
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { queryClient } from '@/services/queryClient'

export default function RootLayout(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

### Protected Routes
```typescript
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          )
        }}
      />
      {/* More tabs */}
    </Tabs>
  )
}
```

### Navigation Hook Usage
```typescript
import { useRouter, useLocalSearchParams, Link } from 'expo-router'

// Programmatic navigation
const router = useRouter()
router.push('/profile')
router.push({ pathname: '/user/[id]', params: { id: '123' } })
router.replace('/login')
router.back()

// Get route params
const { id } = useLocalSearchParams<{ id: string }>()

// Declarative navigation
<Link href="/settings">
  <Text>Go to Settings</Text>
</Link>
```

---

## 3. State Management

### Server State (TanStack Query)
```typescript
// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import type { IUser, UpdateUserInput } from '@/types/user'

// Fetch user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      userService.update(id, data),
    onSuccess: (updatedUser) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
    }
  })
}

// Usage in component
const ProfileScreen = (): JSX.Element => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: user, isLoading, error } = useUser(id)
  const updateUser = useUpdateUser()

  if (isLoading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  return <ProfileView user={user} onUpdate={updateUser.mutate} />
}
```

### Client State (Zustand)
```typescript
// store/useAppStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
  // UI State
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  
  // Notifications
  unreadCount: number
  incrementUnread: () => void
  resetUnread: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      unreadCount: 0,
      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
      resetUnread: () => set({ unreadCount: 0 })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }) // Only persist theme
    }
  )
)
```

---

## 4. API Integration

### API Service Structure
```typescript
// services/api.ts
import { env } from '@/config/env'

const API_BASE = env.EXPO_PUBLIC_API_URL

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

export const api = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {} } = options
  
  const token = await getAuthToken() // From secure storage
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers
    },
    ...(body && { body: JSON.stringify(body) })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new ApiError(response.status, error.error.code, error.error.message)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()
  return json.data as T
}
```

### Service Module
```typescript
// services/user.service.ts
import { api } from './api'
import type { IUser, CreateUserInput, UpdateUserInput } from '@/types/user'

export const userService = {
  getById: (id: string) => api<IUser>(`/api/v1/users/${id}`),
  
  list: (params?: { page?: number; limit?: number }) =>
    api<IUser[]>(`/api/v1/users?${new URLSearchParams(params as Record<string, string>)}`),
  
  create: (data: CreateUserInput) =>
    api<IUser>('/api/v1/users', { method: 'POST', body: data }),
  
  update: (id: string, data: UpdateUserInput) =>
    api<IUser>(`/api/v1/users/${id}`, { method: 'PATCH', body: data }),
  
  delete: (id: string) =>
    api<void>(`/api/v1/users/${id}`, { method: 'DELETE' })
}
```

---

## 5. Form Handling

### Form with React Hook Form + Zod
```typescript
// screens/RegisterScreen.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextInput, Button, FormError } from '@/components/ui'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(12, 'Minimum 12 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof RegisterSchema>

export const RegisterScreen = (): JSX.Element => {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' }
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data)
      router.replace('/login')
    } catch (error) {
      // Handle error
    }
  }

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />
      
      <Button
        title="Register"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </View>
  )
}
```

---

## 6. Theming System

### Theme Configuration
```typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    secondary: '#EC4899',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 }
  }
} as const

export type Theme = typeof theme
```

### Using Theme
```typescript
// ✅ CORRECT: Use theme variables
import { theme } from '@/theme'

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text
  }
})

// ❌ WRONG: Hardcoded values
const badStyles = StyleSheet.create({
  container: {
    padding: 16,         // Use theme.spacing.md
    backgroundColor: '#fff', // Use theme.colors.background
    borderRadius: 12     // Use theme.radius.lg
  }
})
```

---

## 7. Error Handling

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to error tracking service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### API Error Handling
```typescript
// components/screens/ProfileScreen.tsx
import { useUser } from '@/hooks/useUser'

export const ProfileScreen = (): JSX.Element => {
  const { data, isLoading, error, refetch } = useUser(userId)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load profile"
        message={error.message}
        onRetry={refetch}
      />
    )
  }

  return <ProfileView user={data} />
}
```

---

## 8. Performance Optimization

### Memoization
```typescript
// Memoize expensive components
import { memo, useMemo, useCallback } from 'react'

// Memo for components
export const UserCard = memo(({ user, onPress }: UserCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{user.name}</Text>
    </TouchableOpacity>
  )
})

// useMemo for expensive calculations
const sortedUsers = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users]
)

// useCallback for stable function references
const handlePress = useCallback((id: string) => {
  router.push(`/user/${id}`)
}, [router])
```

### FlatList Optimization
```typescript
// Optimized list rendering
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })}
/>
```

### Image Optimization
```typescript
import { Image } from 'expo-image'

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  cachePolicy="memory-disk"
/>
```

---

## 9. Testing Patterns

### Component Test
```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />)
    expect(getByText('Click me')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<Button title="Click" onPress={onPress} />)
    
    fireEvent.press(getByRole('button'))
    
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Submit" onPress={() => {}} loading />
    )
    
    expect(getByTestId('loading-indicator')).toBeTruthy()
    expect(queryByText('Submit')).toBeNull()
  })
})
```

---

## 10. Anti-Patterns

| ❌ Avoid | ✅ Correct Approach |
| :--- | :--- |
| Inline styles | StyleSheet.create() |
| Hardcoded colors/spacing | Use theme variables |
| `any` type | Strict TypeScript interfaces |
| Business logic in components | Extract to hooks/services |
| API URLs in components | Config/environment variables |
| Ignoring loading states | Always show loading indicators |
| Missing error handling | Handle all error cases |
| No accessibility props | Add accessibilityLabel, accessibilityRole |
| Direct AsyncStorage access | Abstract behind service |
| Unoptimized FlatList | Use performance props |

